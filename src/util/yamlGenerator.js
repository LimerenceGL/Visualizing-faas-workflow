import {downloadFile} from "./bpmn";
import YAML from "js-yaml";

export function downloadYAML(graph, workflowName, DOWNLOAD = true) {

    const YAML = require('js-yaml');
    let jsonData = generateYAML_json(graph, workflowName)
    let yamlData = YAML.dump(jsonData)
    if (DOWNLOAD) {
        downloadFile(yamlData, 'application/yaml', 'config.yaml')
    } else {
        return yamlData
    }
}

export function downloadJSON(graph) {
    // let stringData=JSON.stringify(generateYAML_json(graph))
    let stringData = JSON.stringify(graph)
    downloadFile(stringData, 'text/plain', 'config.json')

}

export function generateGraphJson(yamlData) {
    //根据yaml文件生成符合图的json格式文件
    const YAML = require('js-yaml');

    let jsonData = YAML.load(yamlData)
    const workflowName = jsonData['name']
    let startNode = {id: 'startNode', label: '', clazz: 'start',}
    let endNode = {id: 'endNode', label: '', clazz: 'end',}
    if (jsonData.hasOwnProperty('global_input') && Object.keys(jsonData['global_input']).length !== 0) {
        let i = 0
        for (let inputName of Object.keys(jsonData['global_input'])) {
            i += 1
            startNode['input' + i + 'name'] = inputName
            startNode['input' + i + 'task'] = get_prop(jsonData['global_input'][inputName], 'type')
            startNode['input' + i + 'source'] = get_prop(jsonData['global_input'][inputName], 'source')
            startNode['input' + i + 'size'] = get_prop(jsonData['global_input'][inputName], 'size')

        }
        startNode['inputCount'] = i
    }
    if (jsonData.hasOwnProperty('global_output') && Object.keys(jsonData['global_output']).length !== 0) {
        let i = 0
        for (let outputName of Object.keys(jsonData['global_output'])) {
            i += 1
            endNode['output' + i + 'name'] = outputName
            endNode['output' + i + 'task'] = get_prop(jsonData['global_output'][outputName], 'type')
            endNode['output' + i + 'source'] = get_prop(jsonData['global_output'][outputName], 'source')
            endNode['output' + i + 'size'] = get_prop(jsonData['global_output'][outputName], 'size')

        }
        endNode['outputCount'] = i
    }

    //加节点
    let nodes = []
    nodes.push(startNode)
    for (let node of jsonData['steps']) {
        nodes.push(add_node(node))
    }
    nodes.push(endNode)
    //加边
    let edges = []
    let edgeid = 0

    //首先把第一个节点放进去
    // <<--                  注意这里应该加入的是id，但我们的id==name，所以加入name                   -->>
    edges.push(add_edge('startNode', jsonData['steps'][0]['name'], ++edgeid))
    for (let node of jsonData['steps']) {
        if (node.hasOwnProperty('next')) {
            for (let nextN of node['next']) {
                edges.push(add_edge(node['name'], nextN, ++edgeid))
            }
        } else {
            //连接到end
            edges.push(add_edge(node['name'], 'endNode', ++edgeid))
        }
    }
    let rst = {"nodes": nodes, "edges": edges}

    return {rst, workflowName}
}

export function generateYAML_json(graph, workflowName) {
    //将graph的json转化为工作流需要的json
    //Node包含全部信息
    let currentNode;
    //待遍历节点列表
    let nodeList = [];
    //当前节点的json信息
    let result_json = {}
    let steps = []
    let global_inputs, global_outputs = {}
    for (let node of graph['nodes']) {
        if (node['clazz'] === 'start') {
            currentNode = node
            global_inputs = currentNode
            nodeList.push(currentNode);
        }

    }
    while (nodeList.length !== 0) {
        currentNode = nodeList.shift()
        //如果是end节点，退出循环
        if (currentNode['clazz'] === 'end') {

            global_outputs = currentNode
            continue;
        }

        //从边里找到target,该list存储target全部信息
        let targetNodeList = []
        for (let edge of graph['edges']) {
            if (edge['source'] === currentNode['id']) {

                let targetNodeId = edge['target']
                for (let node of graph['nodes']) {
                    if (node['id'] === targetNodeId) {
                        targetNodeList.push(node)
                        nodeList.push(node)
                    }
                }
            }
        }
        //流程图没有以end结尾
        // if (!targetNodeList)
        //     return -1;
        if (currentNode['clazz'] !== 'start')
            steps.push(parseNode(currentNode, targetNodeList));
    }
    result_json['name'] = workflowName
    result_json['global_input'] = parseGlobalInput(global_inputs)
    result_json['steps'] = steps
    result_json['global_output'] = parseGlobalOutput(global_outputs)
    return result_json

}


function parseGlobalInput(node) {

    let rst = {}
    try {
        for (let i = 1; i <= 10; i++) {

            if (node.hasOwnProperty('input' + i + 'name') && node['input' + i + 'name'] !== '') {
                let currentInput = node['input' + i + 'name']
                rst[currentInput] = {}
                rst[currentInput]['type'] = get_prop(node, 'input' + i + 'task')
                rst[currentInput]['source'] = get_prop(node, 'input' + i + 'source')
                rst[currentInput]['size'] = get_prop(node, 'input' + i + 'size')
            }
        }
    } catch (error) {

    }

    return rst
}

function parseGlobalOutput(node) {
    let rst = {}

    for (let i = 1; i <= 10; i++) {
        if (node.hasOwnProperty('output' + i + 'name') && node['output' + i + 'name'] !== '') {
            let currentOutput = node['output' + i + 'name']

            rst[currentOutput] = {}
            rst[currentOutput]['type'] = get_prop(node, 'output' + i + 'task')
            rst[currentOutput]['source'] = get_prop(node, 'output' + i + 'source')
            rst[currentOutput]['size'] = get_prop(node, 'output' + i + 'size')
        }
    }
    return rst
}

function parseNode(node, nextNodes) {
    let parseResult = {}

    if (node['clazz'] === 'mailTask')
        parseResult = parseTaskNode(node)
    else if (node['clazz'] === 'receiveTask')
        parseResult = parseMergeNode(node)
    else if (node['clazz'] === 'scriptTask')
        parseResult = parseForeachNode(node)

    else if (node['clazz'] === 'timerCatch')
        parseResult = parseParallelNode(node)
    else if (node['clazz'] === 'exclusiveGateway')
        //switch 的next字段单独处理
        parseResult = parseSwitchNode(node, nextNodes)
    if (node['clazz'] === 'mailTask' || node['clazz'] === 'scriptTask' || node['clazz'] === 'timerCatch') {
        parseResult['next'] = []
        for (let nextN of nextNodes) {
            if (nextN['id'] !== 'endNode') {
                parseResult['next'].push(nextN['label'])
            }
        }
    }
    if (parseResult.hasOwnProperty('next') && parseResult['next'].length === 0) {
        delete parseResult['next']
    }
    return parseResult

}

function parseTaskNode(node) {
    let rst = {};
    rst['name'] = get_prop(node, 'label');
    rst['type'] = 'task';
    rst['run'] = get_prop(node, 'run');
    rst['runtime'] = get_prop(node, 'runtime', Number);
    rst['mem_usage'] = get_prop(node, 'mem_usage', Number);
    rst['scale'] = get_prop(node, 'scale', Number);
    rst['requirement'] = {};
    rst['requirement']['mem_req'] = get_prop(node, 'reqmem_req', Number);
    rst['requirement']['gpu'] = get_prop(node, 'reqgpu') === 'true'
    rst['inputs'] = {};
    rst['outputs'] = {};

    for (let i = 1; i <= 10; i++) {
        if (node.hasOwnProperty('input' + i + 'name') && node['input' + i + 'name'] !== '') {
            let currentInput = node['input' + i + 'name']
            rst['inputs'][currentInput] = {}
            rst['inputs'][currentInput]['type'] = get_prop(node, 'input' + i + 'task')
            rst['inputs'][currentInput]['source'] = get_prop(node, 'input' + i + 'source')
            rst['inputs'][currentInput]['size'] = get_prop(node, 'input' + i + 'size', Number)
        }
    }
    if (Object.keys(rst.inputs).length === 0) {
        delete rst['inputs']
    }
    for (let i = 1; i <= 10; i++) {
        if (node.hasOwnProperty('output' + i + 'name') && node['output' + i + 'name'] !== '') {
            let currentOutput = node['output' + i + 'name']
            rst['outputs'][currentOutput] = {}
            rst['outputs'][currentOutput]['type'] = get_prop(node, 'output' + i + 'task')
            rst['outputs'][currentOutput]['size'] = get_prop(node, 'output' + i + 'size', Number)
        }
    }
    if (Object.keys(rst.outputs).length === 0) {
        delete rst['outputs']
    }
    return rst
}

function parseMergeNode(node) {
    let rst = {};
    rst['name'] = get_prop(node, 'label');
    rst['type'] = 'merge';
    rst['run'] = get_prop(node, 'run');
    rst['runtime'] = get_prop(node, 'runtime', Number);

    rst['mem_usage'] = get_prop(node, 'mem_usage', Number);
    rst['scale'] = get_prop(node, 'scale', Number);
    rst['requirement'] = {};
    rst['requirement']['mem_req'] = get_prop(node, 'reqmem_req', Number);

    rst['requirement']['gpu'] = get_prop(node, 'reqgpu') === 'true'
    rst['inputs'] = {};
    rst['outputs'] = {};


    for (let i = 1; i <= 10; i++) {

        if (node.hasOwnProperty('input' + i + 'name') && node['input' + i + 'name'] !== '') {
            let currentInput = node['input' + i + 'name']
            rst['inputs'][currentInput] = {}
            rst['inputs'][currentInput]['type'] = get_prop(node, 'input' + i + 'task')
            rst['inputs'][currentInput]['source'] = get_prop(node, 'input' + i + 'source')
            rst['inputs'][currentInput]['size'] = get_prop(node, 'input' + i + 'size', Number)
        }
    }
    if (Object.keys(rst.inputs).length === 0) {
        delete rst['inputs']
    }
    for (let i = 1; i <= 10; i++) {
        if (node.hasOwnProperty('output' + i + 'name') && node['output' + i + 'name'] !== '') {
            let currentOutput = node['output' + i + 'name']
            rst['outputs'][currentOutput] = {}
            rst['outputs'][currentOutput]['type'] = get_prop(node, 'output' + i + 'task')
            rst['outputs'][currentOutput]['size'] = get_prop(node, 'output' + i + 'size', Number)
        }
    }
    if (Object.keys(rst.outputs).length === 0) {
        delete rst['outputs']
    }
    return rst
}

function parseForeachNode(node) {
    let rst = {};
    rst['name'] = get_prop(node, 'label');
    rst['type'] = 'foreach';
    rst['collection'] = get_prop(node, 'collection');
    return rst;
}

function parseParallelNode(node) {
    let rst = {};
    rst['name'] = get_prop(node, 'label');
    rst['type'] = 'parallel';
    return rst;
}

function parseSwitchNode(node, nextNodes) {
    let rst = {};
    rst['name'] = get_prop(node, 'label');
    rst['type'] = 'switch';
    rst['conditions'] = []
    rst['next'] = []
    for (let nextN of nextNodes) {
        for (let props of Object.keys(node)) {
            // console.log(props)

            if (('conditions' + nextN['id']) === props) {
                if (nextN['id'] !== 'endNode') {
                    rst['conditions'].push(node[props])
                    rst['next'].push(nextN['label'])
                }

            }
        }
    }
    return rst;
}


function add_edge(source, target, id) {
    let edge = {}
    edge['source'] = source
    edge['target'] = target
    edge['clazz'] = 'flow'
    edge['shape'] = 'flow-polyline-round'
    edge['id'] = 'flow' + String(id)
    return edge
}

function add_node(oldnode) {
    //type : task|switch|parallel|foreach|
    let clazzdict = {
        "task": "mailTask",
        "switch": "exclusiveGateway",
        "parallel": "timerCatch",
        "foreach": "scriptTask",
        "merge": "receiveTask"
    }
    let type = oldnode['type']
    let node = deepClone(oldnode)
    //公共处理
    node['id'] = node['name']
    node['clazz'] = clazzdict[node['type']]
    node['label'] = node['name']
    node['hideIcon'] = true

    //不同node处理
    if (type === 'task' || type === 'merge') {
        //处理inputs outputs requirement
        if (node.hasOwnProperty('inputs')) {
            let i = 0
            for (let inputName of Object.keys(node.inputs)) {
                i += 1
                node['input' + i + 'name'] = inputName
                node['input' + i + 'task'] = get_prop(node['inputs'][inputName], 'type')
                node['input' + i + 'source'] = get_prop(node['inputs'][inputName], 'source')
                node['input' + i + 'size'] = get_prop(node['inputs'][inputName], 'size')

            }
            node['inputCount'] = i
            delete node['inputs']
        }
        if (node.hasOwnProperty('outputs')) {
            let i = 0
            for (let outputName of Object.keys(node.outputs)) {
                i += 1
                node['output' + i + 'name'] = outputName
                node['output' + i + 'task'] = get_prop(node['outputs'][outputName], 'type')
                node['output' + i + 'size'] = get_prop(node['outputs'][outputName], 'size')

            }
            node['outputCount'] = i
            delete node['outputs']
        }
        if (node.hasOwnProperty('requirement')) {
            node['reqmem_req'] = get_prop(node['requirement'], 'mem_req')
            node['reqgpu'] = get_prop(node['requirement'], 'gpu')
            delete node['requirement']
        }
    } else if (type === 'switch') {
        //处理next和conditions的绑定关系
        let n = node['next'].length
        for (let i = 0; i < n; i++) {
            let tempprops = 'conditions' + node['next'][i]
            node[tempprops] = node['conditions'][i]
        }
        delete node['conditions']
    }
    delete node['type']
    delete node['name']
    delete node['next']
    return node
}


function deepClone(obj) {
    let _obj = JSON.stringify(obj),
        objClone = JSON.parse(_obj);
    return objClone
}

function get_prop(node, prop, type = String) {
    if (node.hasOwnProperty(prop)) {
        return type(node[prop]);
    } else return ''
}