var _BR;

function BinaryReader(buffer, alignment)
{
    var r = {};
    r.buffer = buffer;
    r.alignment = alignment || 4;
    r.bytes = new DataView(buffer);
    r.offset = 0;
    return r;
}

function Request(params)
{
    var r = new XMLHttpRequest();

    var type = params.type || 'GET';
    r.open(type, params.url, true);

    r.responseType = params.response_type || 'arraybuffer';
    
    if(params.fail)
    {
        r.error = params.fail;
        r.abort = params.fail;
    }

    if(params.headers)
    {
        for(var k in params.headers)
        {
            var h = params.headers[k];
            r.setRequestHeader(k, h);
        }
    }

    r.onload = function(e)
    {
        if(e.target.status === 200)
        {
            params.success(e.target.response);
        }
        else 
        {
            if(params.fail) params.fail(e);
        }
    }

    if(params.onchange)
        r.onreadystatechange = params.onchange;

    if(params.onprogress) 
        r.onprogress = params.progress;

    if(params.auto_send !== false)
        r.send();

    return r;
}

function set_reader_ctx(ctx){ _BR = ctx; }
function end_reader_ctx(){ _BR = null; }

function reader_seek(ptr)
{
    _BR.offset = ptr;
}

function get_reader_offset()
{
    return _BR.offset;
}

function read_boolean()
{
    var r = read_i32();
    if(r === 1) return true;
    return false;
}

function read_bytes(count)
{
    var r = new Uint8Array(_BR.buffer, _BR.offset, count);
    _BR.offset += count;
    return r;
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

function read_f64(count)
{
    var r;
    if(count)
    {
        r = new Float64Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 8;
        return r;
    }

    r = _BR.bytes.getFloat64(_BR.offset, true);
    _BR.offset += 8;
    return r;
}

function read_vec(r)
{
    var n = r.length;
    for(var i = 0; i < n; ++i)
    {
        r[i] = read_f32();
    } 
}

function get_padding(alignment, size)
{
    return (alignment - size % alignment) % alignment;
}

function read_string()
{
    var size = read_u32();
    var pad = get_padding(_BR.alignment, size);
    var r = String.fromCharCode.apply(null, new Uint8Array(_BR.buffer, _BR.offset, size));
    _BR.offset += size + pad;
    return r;
}

function uint8_to_base64(input) 
{
    var key_str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;

    var i = 0;
    var n = input.length;
    while (i < n) 
    {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) enc3 = enc4 = 64;
        else if (isNaN(chr3)) enc4 = 64;
        
        output += key_str.charAt(enc1) + key_str.charAt(enc2) +
                  key_str.charAt(enc3) + key_str.charAt(enc4);
    }
    return output;
}