var recording = false;

function toggleRecording() {
    if (recording) {
        chrome.runtime.sendMessage(null, {
            "action": "setRecordingOff"
        }, null, function(resp){
            chrome.tabs.create({
                url: chrome.extension.getURL("main.html")
            });
            window.close();
        });
    } else {
        chrome.runtime.sendMessage(null, {
            "action": "setRecordingOn"
        }, null, function(resp){
            window.close();
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('recordButton').addEventListener('click', toggleRecording);

    updatePopupUI();
});

function updatePopupUI() {
    chrome.runtime.sendMessage(null, {
        "action": "getRecordingStatus"
    }, null, function(recording_status){
        recording = recording_status;
        if (recording) {
            document.getElementById('recordButton').innerHTML = "Stop Recording";
            document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-danger btn-block');
        } else {
            document.getElementById('recordButton').innerHTML = "Start Recording";
            document.getElementById('recordButton').setAttribute('class','btn btn-hover btn-success btn-block');
        }
    });
};

window.onload = function() {
    document.getElementById('dashLink').onclick = function () {
        chrome.tabs.create({
            url: chrome.extension.getURL("main.html")
        });
        window.close();
    };
}
