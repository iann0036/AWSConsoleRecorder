var boto3_editor, go_editor, cli_editor, raw_editor;

window.onload = function(){
    chrome.runtime.sendMessage(null, {
        "action": "getCompiledOutputs"
    }, null, function(response){
        boto3_editor = CodeMirror.fromTextArea(document.getElementById('boto3'), {
            lineNumbers: true,
            lineWrapping: true,
            mode: "python",
            theme: "material",
            indentUnit: 4
        });
        boto3_editor.getDoc().setValue(response['boto3']);
        setTimeout(function() {
            boto3_editor.refresh();
        },1);

        go_editor = CodeMirror.fromTextArea(document.getElementById('go'), {
            lineNumbers: true,
            lineWrapping: true,
            mode: "go",
            theme: "material",
            indentUnit: 4
        });
        go_editor.getDoc().setValue(response['go']);
        setTimeout(function() {
            go_editor.refresh();
        },1);

        cli_editor = CodeMirror.fromTextArea(document.getElementById('cli'), {
            lineNumbers: true,
            lineWrapping: true,
            mode: "shell",
            theme: "material",
            indentUnit: 4
        });
        cli_editor.getDoc().setValue(response['cli']);
        setTimeout(function() {
            cli_editor.refresh();
        },1);

        raw_editor = CodeMirror.fromTextArea(document.getElementById('raw'), {
            lineNumbers: true,
            lineWrapping: true,
            mode: "javascript",
            theme: "material",
            indentUnit: 4
        });
        raw_editor.getDoc().setValue(response['raw']);
        setTimeout(function() {
            raw_editor.refresh();
        },1);
    });

    chrome.runtime.sendMessage(null, {
        "action": "getBlockingStatus"
    }, null, function(blocking_status){
        if (blocking_status) {
            document.getElementById('blocking').checked = true;
        } else {
            document.getElementById('blocking').checked = false;
        }
    });
};

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

document.getElementById('boto3_menubtn').onclick = function(evt) {
    document.getElementById('boto3_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('cli_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('go_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('raw_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('settings_menubtn').setAttribute("class", "btn btn-default m-t-10");

    document.getElementById('boto3_container').style = "";
    document.getElementById('cli_container').style = "display: none;";
    document.getElementById('go_container').style = "display: none;";
    document.getElementById('raw_container').style = "display: none;";
    document.getElementById('settings_container').style = "display: none;";

    boto3_editor.refresh();
};

document.getElementById('cli_menubtn').onclick = function(evt) {
    document.getElementById('boto3_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('cli_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('go_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('raw_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('settings_menubtn').setAttribute("class", "btn btn-default m-t-10");

    document.getElementById('boto3_container').style = "display: none;";
    document.getElementById('cli_container').style = "";
    document.getElementById('go_container').style = "display: none;";
    document.getElementById('raw_container').style = "display: none;";
    document.getElementById('settings_container').style = "display: none;";

    cli_editor.refresh();
};

document.getElementById('go_menubtn').onclick = function(evt) {
    document.getElementById('boto3_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('cli_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('go_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('raw_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('settings_menubtn').setAttribute("class", "btn btn-default m-t-10");

    document.getElementById('boto3_container').style = "display: none;";
    document.getElementById('cli_container').style = "display: none;";
    document.getElementById('go_container').style = "";
    document.getElementById('raw_container').style = "display: none;";
    document.getElementById('settings_container').style = "display: none;";

    go_editor.refresh();
};

document.getElementById('raw_menubtn').onclick = function(evt) {
    document.getElementById('boto3_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('cli_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('go_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('raw_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('settings_menubtn').setAttribute("class", "btn btn-default m-t-10");

    document.getElementById('boto3_container').style = "display: none;";
    document.getElementById('cli_container').style = "display: none;";
    document.getElementById('go_container').style = "display: none;";
    document.getElementById('raw_container').style = "";
    document.getElementById('settings_container').style = "display: none;";

    raw_editor.refresh();
};

document.getElementById('settings_menubtn').onclick = function(evt) {
    document.getElementById('boto3_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('cli_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('go_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('raw_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('settings_menubtn').setAttribute("class", "btn btn-primary m-t-10");

    document.getElementById('boto3_container').style = "display: none;";
    document.getElementById('cli_container').style = "display: none;";
    document.getElementById('go_container').style = "display: none;";
    document.getElementById('raw_container').style = "display: none;";
    document.getElementById('settings_container').style = "";
};
