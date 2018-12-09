import $ from 'jquery';
import {parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let argToParse =  $('#ArgPlaceholder').val();
        let parsedCode = parseCode(codeToParse,argToParse);
        $('#parsedCode').html(parsedCode);//.val(JSON.stringify(parsedCode, null, 2));//
    });
});
