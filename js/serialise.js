var _BR;

function BinaryReader(buffer)
{
    var r = {};
    r.buffer = buffer;
    r.bytes = new DataView(buffer);
    r.offset = 0;
    return r;
}
function request_asset(url, callback)
{
    var r = new XMLHttpRequest();
    r.open('GET', url, true);
    r.onload = callback;
    r.responseType = 'arraybuffer';
    r.send();
}

function set_reader_ctx(ctx){ _BR = ctx; }
function end_reader_ctx(){ _BR = null; }

function read_boolean()
{
    var r = read_i32();
    if(r === 1) return true;
    return false;
}
function read_i32(count)
{
    var r;
    if(count)
    {
        r = new Int32Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 4;
        return r;
    }

    r = _BR.bytes.getInt32(_BR.offset, true);
    _BR.offset += 4;
    return r;
}
function read_u32(count)
{
    var r;
    if(count)
    {
        r = new Uint32Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 4;
        return r;
    }

    r = _BR.bytes.getUint32(_BR.offset, true);
    _BR.offset += 4;
    return r;
}
function read_f32(count)
{
    var r;
    if(count)
    {
        r = new Float32Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 4;
        return r;
    }

    r = _BR.bytes.getFloat32(_BR.offset, true);
    _BR.offset += 4;
    return r;
}
function read_string()
{
    var pad = read_i32();
    var len = read_i32();
    var r = String.fromCharCode.apply(null, new Uint8Array(_BR.buffer, _BR.offset, len));
    _BR.offset += len + pad;
    return r;
}