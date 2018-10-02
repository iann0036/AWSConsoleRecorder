window.onload = function(){
    chrome.runtime.sendMessage(null, {
        "action": "getCompiledOutputs"
    }, null, function(response){
        var boto3_editor = CodeMirror.fromTextArea(document.getElementById('boto3'), {
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

        var cli_editor = CodeMirror.fromTextArea(document.getElementById('cli'), {
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

        var raw_editor = CodeMirror.fromTextArea(document.getElementById('raw'), {
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
};
