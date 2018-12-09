import $ from 'jquery';
import {parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let argToParse =  $('#ArgPlaceholder').val();
        let threesome = parseCode(codeToParse,argToParse);
        let parsedCode=threesome.code;
        let line=threesome.line;
        let color=threesome.color;
        $('#parsedCode').html(Paint_the_Line(parsedCode,line,color));//.val(JSON.stringify(parsedCode, null, 2));//
    });
});

/**
 * @return {string}
 */
function Paint_the_Line(str,line_to_mark,line_color){
    var arr=str.split('\n');
    let output='';
    let painted=0;
    for(var i=0;i<arr.length;i++){
        if(line_to_mark.indexOf(i)>=0){
            if(line_color[painted]===1)
                output+='<span class="green"> <br>'+arr[i]+'</br></span>';
            if(line_color[painted]===2)
                output+='<span class="red"> <br>'+arr[i]+'</br></span>';
            painted++;
        }
        else{
            output+='<br>'+arr[i]+'</br>';
        }}
    return output;
}
