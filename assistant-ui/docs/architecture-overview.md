# Project Overview

This project is a Next.js App Router app that showcases the `@assistant-ui/react` component suite. The UI mimics the CONSTRUIX chat experience while using Gemini (via the `ai` SDK) for responses. This document explains how data flows through the app, which components render each part of the UI, and where to look when extending the project.

## Core Runtime Flow

- `app/page.tsx` renders the `Assistant` component exported from `app/assistant.tsx`.
- `Assistant` sets up the assistant runtime:
  - `useChatRuntime` configures a client runtime that knows how to manage threads, messages, and attachments.
  - `AssistantChatTransport` is pointed at the REST endpoint `/api/chat`.
  - `AssistantRuntimeProvider` wraps the UI so every assistant-ui primitive can consume the runtime context.
- When the user sends a prompt, the runtime performs a `fetch` request to `/api/chat` (HTTP streaming, no WebSocket).
- `app/api/chat/route.ts` receives the POST request, converts the UI-friendly message format to a model format, and calls `streamText` with the `google("gemini-2.0-flash")` model. The helper `toUIMessageStreamResponse` converts the streaming response into the format expected by the client runtime.

> There is no socket layer in this sample. The `AssistantChatTransport` keeps a single HTTP connection open while the model streams tokens and closes the connection when the response is complete.

## Layout and Navigation

- `Assistant` renders the app chrome with components from `components/ui/sidebar`.
- `ThreadListSidebar` (`components/assistant-ui/threadlist-sidebar.tsx`) renders the CONSTRUIX-branded sidebar, new-thread button, and the list of threads via `ThreadList`.
- `ThreadList` (`components/assistant-ui/thread-list.tsx`) delegates to `ThreadListPrimitive` to render the current threads and archive controls. Skeleton placeholders are shown while the runtime is loading.
- The main content area uses `Thread` (`components/assistant-ui/thread.tsx`), which provides the chat viewport, welcome state, messages, and composer.

## Message Rendering

- `Thread` wraps several primitives from `@assistant-ui/react`.
  - `ThreadPrimitive.Messages` iterates over the messages supplied by the runtime and gives control to three components:
    - `AssistantMessage` for assistant replies.
    - `UserMessage` for user prompts (including attachments).
    - `EditComposer` when the user edits an earlier prompt.
- `AssistantMessage`
  - Adds the vertical red accent required by the design.
  - Uses `MessagePrimitive.Parts` with custom components:
    - `MarkdownText` (`components/assistant-ui/markdown-text.tsx`) renders rich markdown output, code blocks, and adds copy buttons.
    - `ToolFallback` handles tool invocations that do not have a dedicated renderer.
  - Shows the branch picker (`BranchPicker`) and action bar with feedback, copy, and regenerate controls.
- `UserMessage`
  - Renders message text inside a rounded bubble using `MessagePrimitive.Parts`.
  - Shows attachments through `UserMessageAttachments`.
  - Provides an inline edit button (`UserActionBar`).
- `MessageError` listens for model or tool errors and displays them inline.

### Markdown Rendering

- `MarkdownText` sets up `MarkdownTextPrimitive` with `remarkGfm` support, custom heading/body styles, and an inline code-copy header.
- The helper hook `useCopyToClipboard` manages copy state for the code header buttons.

### Attachments

- `attachment.tsx` centralizes attachment UI for both the composer and past messages.
  - `ComposerAttachments` displays the attachments the user added before sending a prompt.
  - `ComposerAddAttachment` wraps `ComposerPrimitive.AddAttachment` with the plus-style icon button.
  - `UserMessageAttachments` displays attachment tiles inside a past user message.
  - Image attachments use `AttachmentPreviewDialog` to open a larger preview inside a dialog using the shadcn `Dialog` components.

## Composer and Message Lifecycle

- `Composer` renders the sticky input area at the bottom of the thread.
- `ComposerPrimitive.Input` binds to the runtime state, handling multi-line text and submission via `ComposerPrimitive.Send`.
- When the assistant is running, `ThreadPrimitive.If running>` switches the primary button to `ComposerPrimitive.Cancel`.
- `ThreadScrollToBottom` exposes the floating control that jumps the viewport to the newest message when content overflows.

## Styling System

- `app/globals.css` imports Tailwind, defines CSS variables for the CONSTRUIX color palette (in hex), and configures dark-mode variants.
- Component classes follow the `aui-*` naming convention so you can search/override styles easily.

## Changing the Model or Transport

- The AI provider is configured inside `app/api/chat/route.ts`. Swap `google("gemini-2.0-flash")` for any other provider supported by the `ai` SDK. The commented OpenAI example shows an alternative.
- If you need WebSocket-based streaming, replace `AssistantChatTransport` with a custom transport. The runtime only requires an object that implements the `AssistantTransport` interface and emits tokens/messages.

## Extending the Project

- New side-panel actions: add components to `ThreadListSidebar` or extend `SidebarFooter`.
- Custom tool renderers: pass a component map into `MessagePrimitive.Parts` instead of `ToolFallback`.
- Analytics or logging: hook into the runtime via `useAssistantApi` or intercept requests inside `AssistantChatTransport`.
- The project already exports most helper UI primitives (`TooltipIconButton`, shadcn dialogs, etc.) so you can compose additional controls without re-creating base styles.

Refer to this document when you need to understand or extend the assistant flow, change models, tweak message rendering, or customize styling.
