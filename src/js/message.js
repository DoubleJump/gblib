window.addEventListener('message', function handle_message(e)
{
    //console.log(e);
    var data = e.data;
    if(data.event_type === 'start')
    {
        app_start(data.language);
    }
});

function send_message_to_outer_window(data)
{
    window.parent.postMessage(data, '*');
}