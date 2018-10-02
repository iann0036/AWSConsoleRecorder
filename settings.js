window.onload = function(){
    chrome.runtime.sendMessage(null, {
        "action": "getBlockingStatus"
    }, null, function(blocking_status){
        if (blocking_status) {
            document.getElementById('blocking').checked = true;
        } else {
            document.getElementById('blocking').checked = false;
        }

        document.getElementById('blocking').onchange = function(evt) {
            if (evt.target.checked) {
                chrome.runtime.sendMessage(null, {
                    "action": "setBlockingOn"
                });
            } else {
                chrome.runtime.sendMessage(null, {
                    "action": "setBlockingOff"
                });
            }
        };
    });
};
