import random
import asyncio
import chainlit as cl


VIETNAMESE_WORDS = [
    "xin", "chào", "bạn", "tôi", "là", "một", "trợ", "lý", "ảo", "giúp",
    "đỡ", "người", "dùng", "với", "nhiều", "câu", "hỏi", "khác", "nhau", "về",
    "cuộc", "sống", "công", "việc", "học", "tập", "giải", "trí", "thể", "thao",
    "âm", "nhạc", "phim", "ảnh", "du", "lịch", "ẩm", "thực", "văn", "hóa",
    "lịch", "sử", "địa", "lý", "khoa", "học", "công", "nghệ", "thông", "tin",
    "máy", "tính", "điện", "thoại", "internet", "mạng", "xã", "hội", "facebook",
    "youtube", "google", "apple", "microsoft", "amazon", "tesla", "spacex", "nasa",
    "trí", "tuệ", "nhân", "tạo", "robot", "tự", "động", "hóa", "blockchain",
    "cryptocurrency", "bitcoin", "ethereum", "metaverse", "virtual", "reality", "augmented",
    "thực", "tế", "ảo", "game", "esports", "streaming", "podcast", "video",
    "photo", "design", "art", "music", "dance", "sport", "football", "basketball"
]


@cl.on_chat_start
async def on_chat_start():
    await cl.Message(content="Connected to Chainlit!").send()


@cl.on_message
async def on_message(message: cl.Message):
    msg = cl.Message(content="")
    await msg.send()

    random_words = [random.choice(VIETNAMESE_WORDS) for _ in range(100)]
    
    for i, word in enumerate(random_words):
        token = word if i == 0 else f" {word}"
        await msg.stream_token(token)
        await asyncio.sleep(0.05)
    
    await msg.update()
