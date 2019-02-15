var boto3_editor, go_editor, cfn_editor, tf_editor, cli_editor, js_editor, cdkts_editor, iam_editor, troposphere_editor;

window.onload = function(){
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

    chrome.runtime.sendMessage(null, {
        "action": "getTheme"
    }, null, function(theme){
        chrome.runtime.sendMessage(null, {
            "action": "getCompiledOutputs"
        }, null, function(response){
            boto3_editor = CodeMirror.fromTextArea(document.getElementById('boto3'), {
                lineNumbers: true,
                lineWrapping: true,
                mode: "python",
                theme: theme,
                indentUnit: 4
            });
            boto3_editor.getDoc().setValue(response['boto3']);
    
            go_editor = CodeMirror.fromTextArea(document.getElementById('go'), {
                lineNumbers: true,
                lineWrapping: true,
                mode: "go",
                theme: theme,
                indentUnit: 4
            });
            go_editor.getDoc().setValue(response['go']);
    
            cfn_editor = CodeMirror.fromTextArea(document.getElementById('cfn'), {
                lineNumbers: true,
                lineWrapping: true,
                mode: "yaml",
                theme: theme,
                indentUnit: 4
            });
            cfn_editor.getDoc().setValue(response['cfn']);
    
            tf_editor = CodeMirror.fromTextArea(document.getElementById('tf'), {
                lineNumbers: true,
                lineWrapping: true,
                mode: "ruby",
                theme: theme,
                indentUnit: 4
            });
            tf_editor.getDoc().setValue(response['tf']);

            cli_editor = CodeMirror.fromTextArea(document.getElementById('cli'), {
                lineNumbers: true,
                lineWrapping: true,
                mode: "shell",
                theme: theme,
                indentUnit: 4
            });
            cli_editor.getDoc().setValue(response['cli']);
    
            js_editor = CodeMirror.fromTextArea(document.getElementById('js'), {
                lineNumbers: true,
                lineWrapping: true,
                mode: "javascript",
                theme: theme,
                indentUnit: 4
            });
            js_editor.getDoc().setValue(response['js']);
    
            cdkts_editor = CodeMirror.fromTextArea(document.getElementById('cdkts'), {
                lineNumbers: true,
                lineWrapping: true,
                mode: "javascript",
                theme: theme,
                indentUnit: 4
            });
            cdkts_editor.getDoc().setValue(response['cdkts']);
    
            iam_editor = CodeMirror.fromTextArea(document.getElementById('iam'), {
                lineNumbers: true,
                lineWrapping: true,
                mode: "javascript",
                theme: theme,
                indentUnit: 4
            });
            iam_editor.getDoc().setValue(response['iam']);
    
            troposphere_editor = CodeMirror.fromTextArea(document.getElementById('troposphere'), {
                lineNumbers: true,
                lineWrapping: true,
                mode: "python",
                theme: theme,
                indentUnit: 4
            });
            troposphere_editor.getDoc().setValue(response['troposphere']);
            
            setTimeout(function() {
                boto3_editor.refresh();
                go_editor.refresh();
                cfn_editor.refresh();
                tf_editor.refresh();
                cli_editor.refresh();
                js_editor.refresh();
                cdkts_editor.refresh();
                iam_editor.refresh();
                troposphere_editor.refresh();
            },1);

            $('#theme').val(theme).trigger('change');

            document.getElementById('theme').onchange = function(evt) {
                if (evt.target.value) {
                    chrome.runtime.sendMessage(null, {
                        "action": "setTheme",
                        "theme": evt.target.value
                    });
            
                    boto3_editor.setOption("theme", evt.target.value);
                    go_editor.setOption("theme", evt.target.value);
                    cfn_editor.setOption("theme", evt.target.value);
                    tf_editor.setOption("theme", evt.target.value);
                    cli_editor.setOption("theme", evt.target.value);
                    js_editor.setOption("theme", evt.target.value);
                    cdkts_editor.setOption("theme", evt.target.value);
                    iam_editor.setOption("theme", evt.target.value);
                    troposphere_editor.setOption("theme", evt.target.value);
                }
            };
        });
    });

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
            boto3_editor.getDoc().setValue("# No recorded actions yet");
            go_editor.getDoc().setValue("// No recorded actions yet");
            cfn_editor.getDoc().setValue("# No recorded actions yet");
            tf_editor.getDoc().setValue("# No recorded actions yet");
            cli_editor.getDoc().setValue("# No recorded actions yet");
            js_editor.getDoc().setValue("// No recorded actions yet");
            cdkts_editor.getDoc().setValue("// No recorded actions yet");
            iam_editor.getDoc().setValue("// No recorded actions yet");
            troposphere_editor.getDoc().setValue("# No recorded actions yet");

            setTimeout(function() {
                boto3_editor.refresh();
                go_editor.refresh();
                cfn_editor.refresh();
                tf_editor.refresh();
                cli_editor.refresh();
                js_editor.refresh();
                cdkts_editor.refresh();
                iam_editor.refresh();
                troposphere_editor.refresh();
            },1);
            
            document.getElementById('cleardata_btn').innerHTML = "<span class=\"bold\">Cleared!</span>";
            document.getElementById('cleardata_btn').setAttribute("class", "btn btn-default m-t-10");
            document.getElementById('cleardata_btn').setAttribute("disabled", "disabled");
        });
    };

    document.getElementById('extversion').innerHTML = chrome.runtime.getManifest().version;
};

function resetMenu() {
    document.getElementById('boto3_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('cli_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('go_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('cfn_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('tf_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('js_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('cdkts_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('iam_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('troposphere_menubtn').setAttribute("class", "btn btn-default m-t-10");
    document.getElementById('settings_menubtn').setAttribute("class", "btn btn-default m-t-10");

    document.getElementById('boto3_container').style = "display: none;";
    document.getElementById('cli_container').style = "display: none;";
    document.getElementById('go_container').style = "display: none;";
    document.getElementById('cfn_container').style = "display: none;";
    document.getElementById('tf_container').style = "display: none;";
    document.getElementById('js_container').style = "display: none;";
    document.getElementById('cdkts_container').style = "display: none;";
    document.getElementById('iam_container').style = "display: none;";
    document.getElementById('troposphere_container').style = "display: none;";
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

document.getElementById('tf_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('tf_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('tf_container').style = "";

    tf_editor.refresh();
};

document.getElementById('js_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('js_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('js_container').style = "";

    js_editor.refresh();
};

document.getElementById('cdkts_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('cdkts_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('cdkts_container').style = "";

    cdkts_editor.refresh();
};

document.getElementById('iam_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('iam_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('iam_container').style = "";

    iam_editor.refresh();
};

document.getElementById('troposphere_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('troposphere_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('troposphere_container').style = "";

    troposphere_editor.refresh();
};

document.getElementById('settings_menubtn').onclick = function(evt) {
    resetMenu();
    document.getElementById('settings_menubtn').setAttribute("class", "btn btn-primary m-t-10");
    document.getElementById('settings_container').style = "";
};
