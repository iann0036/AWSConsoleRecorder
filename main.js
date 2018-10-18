var boto3_editor, go_editor, cfn_editor, cli_editor, js_editor;

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

        cfn_editor = CodeMirror.fromTextArea(document.getElementById('cfn'), {
            lineNumbers: true,
            lineWrapping: true,
            mode: "yaml",
            theme: "material",
            indentUnit: 4
        });
        cfn_editor.getDoc().setValue(response['cfn']);
        setTimeout(function() {
            cfn_editor.refresh();
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

        js_editor = CodeMirror.fromTextArea(document.getElementById('js'), {
            lineNumbers: true,
            lineWrapping: true,
            mode: "javascript",
            theme: "material",
            indentUnit: 4
        });
        js_editor.getDoc().setValue(response['js']);
        setTimeout(function() {
            js_editor.refresh();
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

    chrome.runtime.sendMessage(null, {
        "action": "getInterceptStatus"
    }, null, function(intercept_status){
        if (intercept_status) {
            document.getElementById('intercept').checked = true;
        } else {
            document.getElementById('intercept').checked = false;
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

document.getElementById('intercept').onchange = function(evt) {
    if (evt.target.checked) {
        chrome.runtime.sendMessage(null, {
            "action": "setInterceptOn"
        });
    } else {
        chrome.runtime.sendMessage(null, {
            "action": "setInterceptOff"
        });
    }
};

document.getElementById('cleardata_btn').onclick = function(evt) {
    chrome.runtime.sendMessage(null, {
        "action": "clearData"
    }, null, function(result){
        location.reload();
    });
};

function resetMenu() {
    document.getElementById('boto3_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('cli_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('go_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('cfn_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('js_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('settings_menubtn').setAttribute("class", "btn btn-default m-t-10");

    document.getElementById('boto3_container').style = "display: none;";
    document.getElementById('cli_container').style = "display: none;";
    document.getElementById('go_container').style = "display: none;";
    document.getElementById('cfn_container').style = "display: none;";
    document.getElementById('js_container').style = "display: none;";
    document.getElementById('settings_container').style = "display: none;";
}

document.getElementById('boto3_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('boto3_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('boto3_container').style = "";

    boto3_editor.refresh();
};

document.getElementById('cli_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('cli_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('cli_container').style = "";

    cli_editor.refresh();
};

document.getElementById('go_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('go_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('go_container').style = "";

    go_editor.refresh();
};

document.getElementById('cfn_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('cfn_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('cfn_container').style = "";

    cfn_editor.refresh();
};

document.getElementById('js_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('js_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('js_container').style = "";

    js_editor.refresh();
};

document.getElementById('settings_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('settings_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('settings_container').style = "";
};
