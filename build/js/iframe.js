

// Prevent overscroll on mobile devices
/*
window.addEventListener('scroll', function(e)
{
  document.body.style.overflowY = 'hidden';
  e.preventDefault();
});
*/

window.addEventListener('load', function()
{
  console.log('wrapper loaded')

  var iframe = document.querySelector('#webgl-iframe');
  var language = iframe.getAttribute('lang') || 'en';

  // TODO: setup environment variables for development and the urls
  
  var env = 'development';
  var content_url = null;

  if(env === 'development') content_url = 'webgl.html';
  else content_url = 'https://XXXXXXXXX.cloudfront.net/';

  if(has_webgl_support() === false)
  {
    console.log('webgl not supported')

    if(env === 'development') content_url = 'fallback.html';
    else content_url = 'https://XXXXXXXX.cloudfront.net/fallback.html';
  }

  iframe.onload = function(e)
  {
    var w = iframe.contentWindow;
    if(!w) return;
    w.postMessage(
    {
      event_type: 'start',
      language: language
    }, 
    '*');
  };

  iframe.setAttribute('src', content_url);
});

// Messages received from iframe
window.addEventListener('message', function(e)
{
  var msg = e.data;
  console.log('Message received');
  console.log(msg);
  
  /*
  if(msg.event_type === '')
  {
    el.scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
    window.location.href = story_url;
    return;
  }
  */
});

