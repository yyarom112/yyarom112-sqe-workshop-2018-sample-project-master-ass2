import assert from 'assert';
import {parseCode,create_new_st} from '../src/js/code-analyzer';



describe('empty prog', () => {
    it('Test 1', () => {
        assert.equal(arr_to_str(parseCode('')),arr_to_str([])
        );
    });
});

describe('create_new_st test-', () => {
    it('Test 2', () => {
        var table=create_new_st([{name:'a',val:-1},{name:'b',val:-1}],[1,2],[{name:'a',val:3}]);
        assert.equal(table,
            [{name:'a',val:1},{name:'b',val:2}]
        );

    });
});

function obj_to_string(obj){
    let output;
    output += '{' ;
    output +=obj.Line + ' ' ;
    output +=obj.Type + ' ' ;
    output += obj.Name + ' ' ;
    output +=obj.Condition+ ' ' ;
    output +=obj.Value + '}';
    return output;
}

function arr_to_str(arr){
    let output = '[';
    for(var i=0;i<arr.length;i++){
        output += obj_to_string(arr[i]);
    }
    output +=']';
    return output;
}