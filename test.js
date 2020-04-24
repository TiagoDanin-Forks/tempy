import path from 'path';
import {tmpdir} from 'os';
import fs from 'fs';
import stream from 'stream';
import test from 'ava';
import pathExists from 'path-exists';
import tempy from '.';

test('.file()', t => {
	t.true(tempy.file().includes(tmpdir()));
	t.false(tempy.file().endsWith('.'));
	t.false(tempy.file({extension: undefined}).endsWith('.'));
	t.false(tempy.file({extension: null}).endsWith('.'));
	t.true(tempy.file({extension: 'png'}).endsWith('.png'));
	t.true(tempy.file({extension: '.png'}).endsWith('.png'));
	t.true(tempy.file({name: 'custom-name.md'}).endsWith('custom-name.md'));
	t.false(tempy.file({extension: '.png'}).endsWith('..png'));

	t.throws(() => {
		tempy.file({name: 'custom-name.md', extension: '.ext'});
	});

	t.throws(() => {
		tempy.file({name: 'custom-name.md', extension: ''});
	});

	t.notThrows(() => {
		tempy.file({name: 'custom-name.md', extension: undefined});
	});

	t.notThrows(() => {
		tempy.file({name: 'custom-name.md', extension: null});
	});
});

test('.fileAsync()', async t => {
	t.true((await tempy.fileAsync()).includes(tmpdir()));
	t.true((await tempy.fileAsync({extension: 'png'})).endsWith('.png'));
	t.true((await tempy.fileAsync({extension: '.png'})).endsWith('.png'));
	t.true((await tempy.fileAsync({name: 'custom-name.md'})).endsWith('custom-name.md'));
	t.false((await tempy.fileAsync({extension: '.png'})).endsWith('..png'));
});

test('.directory()', t => {
	t.true(tempy.directory().includes(tmpdir()));
});

test('.directoryAsync()', async t => {
	t.true((await tempy.directoryAsync()).includes(tmpdir()));
});

test('.clean()', t => {
	tempy.directory();
	const deleleDirectories = tempy.clean();
	t.true(deleleDirectories.length > 0);
	deleleDirectories.forEach(directory => {
		t.false(pathExists.sync(directory));
	});
});

test('.cleanAsync()', async t => {
	await tempy.directoryAsync();
	const deleleDirectories = await tempy.cleanAsync();
	t.true(deleleDirectories.length > 0);
	deleleDirectories.forEach(directory => {
		t.false(pathExists.sync(directory));
	});
});

test('.jobDirectory()', t => {
	t.true(tempy.jobDirectory(directory => pathExists.sync(directory)));

	const deleleDirectory = tempy.jobDirectory(directory => directory);
	t.false(pathExists.sync(deleleDirectory));
});

test('.jobDirectoryAsync()', async t => {
	t.true(await tempy.jobDirectory(async directory => pathExists(directory)));
	t.true(await tempy.jobDirectory(directory => pathExists.sync(directory)));

	const deleleDirectory = await tempy.jobDirectory(directory => directory);
	t.false(await pathExists(deleleDirectory));
});

test('.jobFile()', t => {
	t.true(tempy.jobFile(file => file.endsWith('custom-name.md'), {name: 'custom-name.md'}));

	const deleleDirectory = tempy.jobFile(file => path.dirname(file), {name: 'custom-name.md'});
	t.false(pathExists.sync(deleleDirectory));
});

test('.jobFileAsync()', async t => {
	t.true(await tempy.jobFile(async file => file.endsWith('custom-name.md'), {name: 'custom-name.md'}));
	t.true(await tempy.jobFile(file => file.endsWith('custom-name.md'), {name: 'custom-name.md'}));

	const deleleDirectory = await tempy.jobFile(file => path.dirname(file), {name: 'custom-name.md'});
	t.false(await pathExists(deleleDirectory));
});

test('.write(string)', async t => {
	const filePath = await tempy.write('unicorn', {name: 'test.png'});
	t.is(fs.readFileSync(filePath, 'utf8'), 'unicorn');
	t.is(path.basename(filePath), 'test.png');
});

test('.write(buffer)', async t => {
	const filePath = await tempy.write(Buffer.from('unicorn'));
	t.is(fs.readFileSync(filePath, 'utf8'), 'unicorn');
});

test('.write(stream)', async t => {
	const readable = new stream.Readable({
		read() {}
	});
	readable.push('unicorn');
	readable.push(null);
	const filePath = await tempy.write(readable);
	t.is(fs.readFileSync(filePath, 'utf8'), 'unicorn');
});

test('.write(stream) failing stream', async t => {
	const readable = new stream.Readable({
		read() {}
	});
	readable.push('unicorn');
	setImmediate(() => {
		readable.emit('error', new Error('Catch me if you can!'));
		readable.push(null);
	});
	await t.throwsAsync(() => tempy.write(readable), {
		instanceOf: Error,
		message: 'Catch me if you can!'
	});
});

test('.writeSync()', t => {
	t.is(fs.readFileSync(tempy.writeSync('unicorn'), 'utf8'), 'unicorn');
});

test('.root', t => {
	t.true(tempy.root.length > 0);
	t.true(path.isAbsolute(tempy.root));

	t.throws(() => {
		tempy.root = 'foo';
	});
});

// TODO Add test auto clean and disable auto clean
