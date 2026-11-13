import test from 'node:test';
import assert from 'node:assert/strict';
import {redactDiagnosticText as redact} from '../ANATOMY/SLP/diagnostic-redaction.js';

test('debug redactor removes email addresses without deleting the error type',()=>{
 const output=redact('NetworkError contacting patient.contact+test@example.org');
 assert.equal(output,'NetworkError contacting [REDACTED_EMAIL]');
});

test('debug redactor strips bearer, basic, named API keys, access tokens and password assignments',()=>{
 const source='Bearer aaaaa.bbbbb.ccccc; Basic c29tZTpwYXNz; api_key=abcd1234; '+
  'x-api-key: aFakeSecret123; access_token: "hidden"; password=secret';
 const value=redact(source);
 for(const token of ['aaaaa','c29tZTpwYXNz','abcd1234','aFakeSecret123','hidden','password=secret'])
  assert.equal(value.includes(token),false,token+' was not redacted');
 assert.match(value,/Bearer \[REDACTED_TOKEN\]/);
 assert.match(value,/api_key=\[REDACTED_TOKEN\]/);
});

test('debug redactor strips provider-prefix credentials and JWTs',()=>{
 const values=[
  'sk-proj-ABCdef123456xyzXYZ',
  'ghp_abcdEFG12345678HJKL90',
  'github_pat_ABCD1234xyz012345',
  'AIzaabcdEFGH123456',
  'xoxb-abcdefghijkl',
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SignatureWithLongTail'
 ];
 const output=redact('Rejection: '+values.join(' | '));
 for(const token of values)assert.ok(!output.includes(token),'token leaked: '+token);
});

test('debug redactor hides long hexadecimal and opaque base64/base64url strings',()=>{
 const sensitive=[
  'aabbccddeeff00112233445566778899',
  'c3VwZXJzZWNyZXREaWFnbm9zdGljVG9rZW4=',
  'Mzc3NzQ1V1O7RDL1G80ywUda35ywXYZ0_AYklS'
 ];
 const output=redact(sensitive.join(' / '));
 for(const item of sensitive)assert.equal(output.includes(item),false);
 assert.match(output,/REDACTED_LONG_HEX/);
 assert.match(output,/REDACTED_OPAQUE/);
});

test('debug redactor strips queries and fragments from absolute and relative URLs',()=>{
 const source=[
  'GET https://example.org/anatomy/model.glb?apikey=hunter2&session=xyz#private',
  'POST http://localhost:8888/api?a=123#hidden',
  'path /api/items?token=abc123#note',
  'relative ./asset.glb?key=fakekey',
  'www.example.org/lab?email=private@example.com#section'
 ].join('\n');
 const output=redact(source);
 for(const secret of ['hunter2','session=xyz','private','a=123','hidden','abc123','fakekey','private@example.com'])
  assert.equal(output.includes(secret),false,secret+' leaked');
 for(const url of ['https://example.org/anatomy/model.glb',
  'http://localhost:8888/api','/api/items','./asset.glb','www.example.org/lab'])
  assert.ok(output.includes(url),'lost safe URL path '+url);
 assert.match(output,/REDACTED_URL_PARAMS/);
});

test('debug redactor covers a synthetic window.onerror and unhandledrejection report',()=>{
 const original='window.onerror: Error https://host.tld/api?token=keepSecret#flag '+
 'jane@example.com Bearer dangerousValue123\n'+
 'unhandledrejection: sk-proj-LongCredential12345678 '+
 'aabbccddeeff00112233445566778899';
 const text=redact(original);
 for(const secret of ['keepSecret','jane@example.com','dangerousValue123','LongCredential12345678',
 'aabbccddeeff00112233445566778899'])
  assert.equal(text.includes(secret),false);
 assert.match(text,/window.onerror: Error/);
 assert.match(text,/unhandledrejection:/);
});

test('debug redactor retains non-sensitive diagnostic data and is safe for null',()=>{
 assert.equal(redact('WebGL context lost at 2026-11-13T12:01:00Z; canvas 390x352'),
 'WebGL context lost at 2026-11-13T12:01:00Z; canvas 390x352');
 assert.equal(redact(null),'');
 assert.equal(redact(undefined),'');
});

test('redaction is idempotent and does not re-expand redaction labels',()=>{
 const original='Error: https://example.com/foo?password=abc#id user@mail.com Bearer XYZ123123123';
 assert.equal(redact(redact(original)),redact(original));
});
