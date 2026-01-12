---
title: "Custom frontend with Chainlit!"
tags: ["custom", "frontend", "chainlit"]
---

## Install Chainlit and OpenAI

```shell
pip install -U chainlit openai
```

## Start the Chainlit server

Start the server in headless mode:

```shell
cd ./backend
uvicorn app:app --host 0.0.0.0 --port 80
```

## Start the React app

```shell
cd ./frontend
npm i
npm run dev
```
