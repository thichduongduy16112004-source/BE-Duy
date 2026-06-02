# Mock RAG - Thịnh sẽ thay thế file này bằng implementation thật
async def retrieve_context(query: str, character_id: str):
    """
    Mock function - trả về list rỗng tạm thời
    Thịnh implement: query VectorDB, trả về top 5 đoạn SGK liên quan
    """
    return []
