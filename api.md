# Edgeflow API 文档

## 概述
本 API 提供Edgeflow工作流管理的基本功能

## 基本 URL
baseurl=""

## 端点目录

1. [部署工作流](#1-部署工作流)
2. [获取工作流实例列表](#2-获取工作流实例列表)
3. [获取工作流实例的详细执行情况](#3-获取工作流实例的详细执行情况)
4. [取消部署（卸载）工作流](#4-取消部署卸载工作流)
5. [调用部署的工作流](#5-调用部署的工作流)

## API 端点

### 1-部署工作流

**URL:** `/deploy/{workflowName}`

**方法:** `POST`

**请求头：**

- `Content-Type: application/x-yaml`

**请求体：**

yaml格式的workflow作为请求体发送

**请求示例：**

```yaml
global_input: {}
steps:
  - name: rand
    type: task
    run: testrand
    runtime: 1
    mem_usage: 0.25
    scale: 2
    requirement:
      mem_req: 0.25
      gpu: false
    outputs:
      rand_resulta:
        type: pass
        size: 8
      rand_resultb:
        type: pass
        size: 8
global_output:
  numb:
    type: pass
    source: rand.rand_resultb
    size: '8'


```

**成功响应：**

- **状态码:** `200 OK`
- **响应内容：**
```json
{
  "message": "YAML 文件上传成功",
  "workflow_name": "workflow1" //返回唯一标识，如何是id，则返回workflow_id
}
```

**错误响应**

* **状态码：**`400 Bad Request`

* **响应内容：**

```json
{
  "error": {
    "code": "INVALID_YAML",
    "message": "YAML无效，部署失败",
    "details": "具体问题的描述，例如缺少必需的键或值的格式不正确等"
  }
}
```

------

### 2-获取工作流实例列表

**URL:** `/workflow-instances`

**方法:** `GET`

**请求参数：** 

| 参数名称 | 类型   | 必需 | 描述               |
| -------- | ------ | ---- | ------------------ |
| name     | string | 是   | 要查询的工作流名称 |

**请求示例：**

`GET /workflow-instances?name=my_workflow`

**成功响应：**

- **状态码:** `200 OK`
- **响应内容：**
```json
{
  "workflow_name": "my_workflow",
  "instances": [
    {
      "id": "instance1",
      "status": "running",
      "start_time":"2023-4-17 15:31:40",
      "end_tme":"2023-4-17 15:34:29"
    },
    {
      "id": "instance2",
      "status": "finished",
      "start_time":"2023-4-17 15:31:40",
      "end_tme":""
    },
    {
      "id": "instance3",
      "status": "failed",
      "start_time":"2023-4-17 15:31:40",
      "end_tme":"2023-4-17 15:34:29"
    }
  ]
}
```

**错误响应**

* **状态码：**`404 Not Found`

* **响应内容：**

  ```json
  {
    "error": {
      "code": 404,
      "message": "工作流未找到",
    }
  }
  ```

***

### 3-获取工作流实例的详细执行情况

**URL:** `/workflow/status/{callid}`

**方法:** `GET`

**请求说明：**

若响应中：

```
status='running'
```

前端1次/1秒的频率轮询获取该工作流的详细执行情况

**请求参数：**

| 参数名称    | 类型   | 必需 | 描述               |
| ----------- | ------ | ---- | ------------------ |
| instance_id | string | 是   | 要查询的工作流名称 |

**请求示例：**

`**请求示例：**

`GET /workflow/status/instance1`

**成功响应：**

- **状态码:** `200 OK`
- **响应内容：**
```json
{
  "instance_id": "instance1",
  "workflow_name": "my_workflow",
  "status": "running",
  "result": "", //if status=='error'|'finished' : result=(错误信息)|(运行结果)
  "nodes": [
    {
      "name": "rand",
      "status": "finished",
    },
    {
      "name": "switchcal",
      "status": "running",
    },
    {
      "name": "invalid",
      "status": "pending",
    },
    {
      "name": "sqrt",
      "status": "pending",
    },
  ]
}
```

```json
{
  "instance_id": "instance1",
  "workflow_name": "my_workflow",
  "status": "error",
  "result": "sqrt函数运行失败", //if status=='error'|'finished' : result=(错误信息)|(运行结果)
  "nodes": [
    {
      "name": "rand",
      "status": "finished",
    },
    {
      "name": "switchcal",
      "status": "running",
    },
    {
      "name": "invalid",
      "status": "pending",
    },
    {
      "name": "sqrt",
      "status": "error",
    },
  ]
}
```

**错误响应**

* **状态码：**`404 Not Found`

* **响应内容：**

  ```json
  {
    "error": {
      "code": 404,
      "message": "工作流实例未找到",
    }
  }
  ```


### 4-取消部署（卸载）工作流

**URL:** `/workflow/undeploy`

**方法:** `POST`

**请求头：**

- `Content-Type: application/json`

**请求体：**

包含要取消部署的工作流名称或ID的JSON对象

```json
{
  "workflow_name": "workflow1"
}
```

**成功响应：**

- **状态码:** `200 OK`
- **响应内容：**

```json
{
  "message": "工作流已成功取消部署",
  "workflow_name": "workflow1"
}
```

**错误响应：**

- **状态码:** `400 Bad Request`
- **响应内容：**

```json
{
  "error": {
    "code": "UNDEPLOY_ERROR",
    "message": "工作流无法取消部署",
    "details": "具体问题的描述，例如工作流不存在或其他原因导致无法取消部署"
  }
}
```

### 5-调用部署的工作流

**URL:** `/workflow/execute/{workflowName}`

**方法:** `POST`

**请求头：**

- `Content-Type: application/json`

**请求体：**

包含要调用的工作流名称或ID的JSON对象

```json
{
  "workflow_name": "workflow1"
}
```

**成功响应：**

- **状态码:** `200 OK`
- **响应内容：**

```json
{
  "message": "工作流已成功调用",
  "workflow_name": "workflow1",
  "instance_id": "instance123" // 返回新产生的工作流实例ID
}
```

**错误响应：**

- **状态码:** `400 Bad Request`
- **响应内容：**

```json
{
  "error": {
    "code": "INVOKE_ERROR",
    "message": "工作流无法调用",
    "details": "具体问题的描述，例如工作流不存在或其他原因导致无法调用"
  }
}
```

### 
