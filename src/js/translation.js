function set_language(lang)
{
    console.log('Setting language: ' + lang);
    app.language = lang;
}

function get_translated_text(key)
{
	if(!app.translations) return key;
	var result = app.translations[key]
	if(!result) return key;
	return result;
}