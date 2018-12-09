/* eslint-disable complexity */
import * as esprima from 'esprima';

import * as escodegen from 'escodegen';

export {parseCode,create_new_st};

let st;
let st_output;
let color;
let if_line;


const parseCode = (codeToParse,args_val) => {
    st=[];
    st_output=[];
    color=[];
    if_line=[];
    var args=_cut_the_args_val(args_val);
    var code=json_analyzer(esprima.parseScript(codeToParse,{loc:true}),args,0);
    var str_code= escodegen.generate(code);
    get_if_line(str_code);
    return {code:str_code,line:if_line,color:color};
    // return esprima.parseScript(codeToParse,{loc:true});
};

function strcmp(a, b)
{
    return (a<b?-1:(a>b?1:0));
}

function get_if_line(str){
    let arr=str.split('\n');
    for(var i=0;i<arr.length;i++){
        if(arr[i].indexOf('if')>=0)
            if_line.push(i);
    }
}



function copy_arr(aObject) {
    if (!aObject) {
        return aObject;
    }

    let v;
    let bObject = Array.isArray(aObject) ? [] : {};
    for (const k in aObject) {
        v = aObject[k];
        bObject[k] = (typeof v === 'object') ? copy_arr(v) : v;
    }

    return bObject;
}

function _cut_the_args_val(args_val) {
    var output=[];
    if(args_val==='')
        return output;
    var num='';
    var i=0;
    while (args_val[i]!==')'){
        while((args_val[i] >= '0' && args_val[i] <= '9')||(args_val[i] >= 'A' && args_val[i] <= 'Z')||(args_val[i] >= 'a' && args_val[i] <= 'z')){
            num+=args_val[i];
            if(args_val[i+1]===')')
                break;
            i++;
        }
        if(num!=='')
            output.push(num);
        num='';
        i++;
    }
    return output;
}

function create_new_st(params,args_val) {
    var chk=false;
    for(var i=0;i<params.length;i++){
        for(var j=0;j<st.length && !chk;j++){
            if(strcmp(st[j].name,params[i].name)===0){
                st[j].val=args_val[i];
                chk=true;}}
        if(!chk)
            st.push({name:params[i].name , val:args_val[i],depth:0 ,arg:true});
        chk=false;
    }
    return st;
}


function removed_depth(n){
    for(var i=(st.length-1);i>=0;i--){
        if(st[i].depth===n){
            st_output.push(st.splice(i,1));
        }
    }
}

function eval_BinaryExpression(lst,depth) {
    var left=eval_val(lst.left,depth);
    var right=eval_val(lst.right,depth);
    return binary_calculation(lst.operator,left,right);
}

function eval_Identifier(lst,depth) {
    var name=lst.name;
    var index=check_if_id_in_st(name,depth);
    if(index<0)
        return name;
    if(st[index].arg)
        return name;
    return st[index].val;
}

function eval_UpdateExpression(lst, depth) {
    var name=lst.argument.name;
    var i=check_if_id_in_st(name,depth);
    if(i<0) {
        throw 'Syntax error';
    }
    switch (lst.operator) {
    case '++':
        st[i].val=st[i].val+1;
        return st[i].val;
    case '--':
        st[i].val=st[i].val-1;
        return st[i].val;
    }
}

function eval_val(lst,depth){
    switch (lst.type) {
    case 'BinaryExpression':
        return eval_BinaryExpression(lst,depth);
    case 'Identifier':
        return eval_Identifier(lst,depth);
    case 'Literal':
        return lst.value;
    case 'UpdateExpression':
        return eval_UpdateExpression(lst,depth);

    }
}

function check_if_id_in_st(id,depth){
    var output=-1;
    for(var i=0;i<st.length;i++){
        if(st[i].name===id){
            if(output===-1)
                output=i;
            else{
                if(st[output].depth-depth>st[i].depth-depth)
                    output=i;
            }
        }
    }
    return output;
}

function binary_calculation(operator,left,right){
    if(typeof left=== 'number' && left===0)
        return right;
    if(typeof right=== 'number' && right===0)
        return left;
    if(typeof left=== 'number' && typeof right=== 'number'){
        switch (operator) {
        case '+': return (left+right);
        case '-': return (left-right);
        case '*': return (left*right);
        case '/': return (left/right);
        }
    }
    else{
        return left+' '+operator+' '+right;
    }
}

function get_the_real_value(str){
    var arr=str.split(' ');
    for(var i=0;i<arr.length;i++){

        if(isNaN(+arr[i]) && (arr[i]!=='+'&&arr[i]!=='-'&&arr[i]!=='*'&&arr[i]!=='/')){
            var j=check_if_id_in_st(arr[i]);
            arr[i]=st[j].val;
        }
    }
    var output=arr[0];
    for( i=1;i<arr.length;i++){
        output+=arr[i];
    }
    return eval(output);
}

function get_the_color(lst,args_val,depth){
    var left=eval_val(lst.left,depth);
    left=get_the_real_value(left);
    var right=eval_val(lst.right,depth);
    right=get_the_real_value(right);
    if(eval(left+' '+lst.operator+' '+right))
        color.push(1);
    else
        color.push(2);
}



function json_analyzer(lst,args_val,depth) {
    if (!lst)
        return;
    switch (lst.type) {
    case 'Program':
        return json_analyzer(lst.body[0],args_val,depth);
    case 'FunctionDeclaration':
        return nt_FunctionDeclaration(lst,args_val,depth);
    case 'BlockStatement':
        return nt_BlockStatement(lst,args_val,depth);
    default:
        return json_analyzer2(lst,args_val,st,depth);

    }
}



function json_analyzer2(lst,args_val,st,depth) {
    switch (lst.type) {
    case 'VariableDeclaration':
        return nt_VariableDeclaration(lst,args_val,depth);
    case 'VariableDeclarator':
        return nt_VariableDeclarator(lst,args_val,depth);
    case 'Identifier':
        return nt_Identifier(lst,args_val,depth);
    case 'BinaryExpression':
        return nt_BinaryExpression(lst,args_val,depth);
    default:
        return json_analyzer3(lst,args_val,depth);

    }
}
//
//


function json_analyzer3(lst,args_val,st,depth) {
    switch (lst.type) {
    case 'Literal':
        return lst;
    case 'IfStatement':
        return nt_IfStatement(lst,args_val,depth);
    case 'ExpressionStatement':
        return nt_ExpressionStatement(lst,args_val,depth);
    case 'AssignmentExpression':
        return nt_AssignmentExpressiont(lst,args_val,depth);
    default:
        return json_analyzer4(lst,args_val,depth);
    }
}


function json_analyzer4(lst,args_val,depth) {
    switch (lst.type) {
    case 'ReturnStatement':
        return nt_return(lst,args_val,depth);
    case 'WhileStatement':
        return nt_WhileStatement(lst,args_val,depth);
    case 'UpdateExpression':
        return nt_UpdateExpression(lst,args_val,depth);
    case 'ForStatement':
        return nt_ForStatement(lst,args_val,depth);
    default: return lst;
        //     return json_analyzer3(lst,args_val,st);

    }
}

function nt_FunctionDeclaration(lst,args_val,depth){
    var output=lst;
    create_new_st(output.params,args_val);
    output.body=json_analyzer(output.body,args_val,depth);
    removed_depth(0);
    return output;
}

function nt_BlockStatement(lst, args_val,depth) {
    var output=lst;
    for(var i=0;i<lst.body.length;i++){
        output.body[i]=json_analyzer(lst.body[i],args_val,depth+1);
    }
    if(lst.body.length>1) {
        for (var j = output.body.length - 1; j >= 0; j--) {
            if (output.body[j].type === 'VariableDeclaration') {
                output.body.splice(j, 1);
            }
            else {
                if (output.body[j].type === 'ExpressionStatement' && output.body[j].expression.type === 'AssignmentExpression' && output.body[j].expression.left.type === 'Identifier') {
                    var name = output.body[j].expression.left.name;
                    var idx = check_if_id_in_st(name, depth + 1);
                    if (idx < 0 || !st[idx].arg) {
                        output.body.splice(j, 1);}}}}}
    removed_depth(depth+1);
    return output;
}

function nt_VariableDeclaration(lst, args_val, depth) {
    var output=lst;
    for(var i=0;i<output.declarations.length;i++){
        output.declarations[i]=json_analyzer(output.declarations[i],args_val,depth);
    }
    return output;
}

function nt_VariableDeclarator(lst, args_val, cur_depth) {
    var output=lst;
    var name= output.id.name;
    var val= eval_val(output.init, cur_depth);
    st.push({name:name,val:val,depth:cur_depth,arg:false});
    output.id=json_analyzer(lst.id,args_val,cur_depth);
    output.init=json_analyzer(lst.init,args_val,cur_depth);
    return output;
}

function nt_Identifier(lst, args_val, depth) {
    var output=lst;
    var i=check_if_id_in_st(lst.name,depth);
    if(i<0)
        return output;
    if(st[i].arg)
        return output;
    output.name=st[i].val.toString();
    return output;
}

function nt_BinaryExpression(lst, args_val,depth) {
    var output=lst;

    output.left=json_analyzer(lst.left,args_val,depth);
    output.right=json_analyzer(lst.right,args_val,depth);
    if(output.left.type==='Literal' && output.left.value===0)
        return output.right;
    if(output.right.type==='Literal' && output.right.value===0)
        return output.left;
    return output;
}


function nt_IfStatement(lst, args_val, depth) {
    var output=lst;
    output.test=json_analyzer(output.test,args_val,depth);
    get_the_color(lst.test, args_val, depth);
    depth=depth+1;
    var tmp=copy_arr(st);
    output.consequent=json_analyzer(output.consequent,args_val,depth);
    removed_depth(depth);
    st=copy_arr(tmp);
    output.alternate=json_analyzer(output.alternate,args_val,depth);
    removed_depth(depth);
    st=copy_arr(tmp);
    return output;
}

function nt_ExpressionStatement(lst, args_val, depth) {
    var output=lst;
    output.expression= json_analyzer(output.expression,args_val,depth);
    return output;
}

function nt_AssignmentExpressiont(lst, args_val, depth) {
    var output=lst;
    var right=eval_val(lst.right,depth);

    var i=check_if_id_in_st(lst.left.name,depth);
    if(i<0)
        throw 'syntax error';
    st[i].val=right;
    output.right= json_analyzer(output.right,args_val,depth);
    return output;
}

function nt_return(lst, args_val, depth) {
    var output=lst;
    output.argument=json_analyzer(output.argument, args_val, depth);
    return output;
}

function nt_WhileStatement(lst, args_val, depth) {
    var output=lst;
    var tmp=copy_arr(st);
    output.test=json_analyzer(output.test,args_val,depth);
    depth++;
    output.body=json_analyzer(output.body,args_val,depth);
    removed_depth(depth);
    st=copy_arr(tmp);
    return output;
}

function nt_UpdateExpression(lst, args_val, depth) {
    eval_val(lst,depth);
    return lst;
}

function nt_ForStatement(lst, args_val, depth) {
    var output=lst;
    output.init=json_analyzer(output.init,args_val,depth);
    output.test=json_analyzer(output.init,args_val,depth);
    var tmp=copy_arr(st);
    depth++;
    output.body=json_analyzer(output.body,args_val,depth);
    removed_depth(depth);
    st=copy_arr(tmp);
    depth--;
    output.update=json_analyzer(output.update,args_val,depth);
    return output;

}
