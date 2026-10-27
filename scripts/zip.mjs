import { crc32, deflateRawSync } from "node:zlib";

const LOCAL_HEADER = 0x04034b50;
const CENTRAL_HEADER = 0x02014b50;
const END_OF_CENTRAL = 0x06054b50;
const VERSION = 20;
const DEFLATE = 8;
const DOS_DATE_1980_01_01 = 0x21;

function local(name, data, compressed) {
	const header = Buffer.alloc(30);
	header.writeUInt32LE(LOCAL_HEADER, 0);
	header.writeUInt16LE(VERSION, 4);
	header.writeUInt16LE(DEFLATE, 8);
	header.writeUInt16LE(DOS_DATE_1980_01_01, 12);
	header.writeUInt32LE(crc32(data), 14);
	header.writeUInt32LE(compressed.length, 18);
	header.writeUInt32LE(data.length, 22);
	header.writeUInt16LE(name.length, 26);
	return Buffer.concat([header, name, compressed]);
}

function central(name, data, compressed, offset) {
	const header = Buffer.alloc(46);
	header.writeUInt32LE(CENTRAL_HEADER, 0);
	header.writeUInt16LE(VERSION, 4);
	header.writeUInt16LE(VERSION, 6);
	header.writeUInt16LE(DEFLATE, 10);
	header.writeUInt16LE(DOS_DATE_1980_01_01, 14);
	header.writeUInt32LE(crc32(data), 16);
	header.writeUInt32LE(compressed.length, 20);
	header.writeUInt32LE(data.length, 24);
	header.writeUInt16LE(name.length, 28);
	header.writeUInt32LE(offset, 42);
	return Buffer.concat([header, name]);
}

export function zip(files) {
	const locals = [];
	const centrals = [];
	let offset = 0;
	for (const { path, data } of files) {
		const name = Buffer.from(path);
		const compressed = deflateRawSync(data);
		const entry = local(name, data, compressed);
		centrals.push(central(name, data, compressed, offset));
		locals.push(entry);
		offset += entry.length;
	}
	const directory = Buffer.concat(centrals);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(END_OF_CENTRAL, 0);
	end.writeUInt16LE(files.length, 8);
	end.writeUInt16LE(files.length, 10);
	end.writeUInt32LE(directory.length, 12);
	end.writeUInt32LE(offset, 16);
	return Buffer.concat([...locals, directory, end]);
}
