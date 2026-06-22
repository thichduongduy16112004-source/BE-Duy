import json
import os
from pathlib import Path

# Paths
CHAPTERS_DIR = Path("C:/Users/LECOO/Downloads/EXE/BE-Duy/frontend/public/noidungtracnghiem/chapters")
BACKUP_DIR = CHAPTERS_DIR / "chapters_backup"

def extract_topic_id(unit_id):
    """Extract numeric id from unitId: 'u1' -> 1"""
    return int(unit_id[1:])

CANONICAL_NODE_TYPES = ["lesson", "lesson", "practice", "lesson", "lesson", "practice", "boss"]
QUESTION_NODE_TYPES = {"lesson", "story"}


def distribute_questions(question_count, lesson_node_count):
    if lesson_node_count <= 0:
        return []
    base = question_count // lesson_node_count
    remainder = question_count % lesson_node_count
    return [base + (1 if index < remainder else 0) for index in range(lesson_node_count)]


def map_only_title(node_type):
    if node_type == "practice":
        return "Luyện tập"
    if node_type == "boss":
        return "Tổng ôn chương"
    if node_type == "review":
        return "Ôn tập ngẫu nhiên"
    return "Bài học"


def default_node_xp(node_type, question_count):
    if node_type == "practice":
        return 30
    if node_type == "boss":
        return 60
    if node_type == "review":
        return 50
    return max(10, question_count * 10)


def build_canonical_nodes(unit_id, question_count):
    lesson_node_indexes = [index for index, node_type in enumerate(CANONICAL_NODE_TYPES) if node_type in QUESTION_NODE_TYPES]
    counts = distribute_questions(question_count, len(lesson_node_indexes))
    lesson_cursor = 0
    nodes = []
    for index, node_type in enumerate(CANONICAL_NODE_TYPES, start=1):
        node_id = f"{unit_id}-l{index}"
        if node_type in QUESTION_NODE_TYPES:
            node_question_count = counts[lesson_cursor] if lesson_cursor < len(counts) else 0
            question_start = sum(counts[:lesson_cursor])
            lesson_cursor += 1
            nodes.append({
                "id": node_id,
                "title": f"Bài học {lesson_cursor}",
                "questionStart": question_start,
                "questionCount": node_question_count,
                "type": node_type,
                "xp": default_node_xp(node_type, node_question_count),
            })
            continue
        nodes.append({
            "id": node_id,
            "title": map_only_title(node_type),
            "questionStart": 0,
            "questionCount": 0,
            "type": node_type,
            "xp": default_node_xp(node_type, 0),
        })
    return nodes


def lesson_id_for_question(index, nodes):
    for node in nodes:
        if node.get("type") not in QUESTION_NODE_TYPES:
            continue
        start = node["questionStart"]
        end = start + node["questionCount"]
        if start <= index < end:
            return node["id"]
    return nodes[0]["id"]

def transform_question(question, topic, global_id, lesson_id):
    """Transform a single question to standard format"""
    answer_value = question["answer"]
    if isinstance(answer_value, int):
        if answer_value < 0 or answer_value >= len(question["options"]):
            print(f"[WARN] Invalid answer index {answer_value} for question {question['id']}")
            answer_text = question["options"][0]
        else:
            answer_text = question["options"][answer_value]
    else:
        answer_text = answer_value
    
    # Build transformed question
    return {
        "id": question["id"],
        "question": question["question"],
        "type": question["type"],
        "options": question["options"],
        "answer": answer_text,  # Changed from index to string
        "explanation": question["explanation"],
        "text": None,  # For fill_blank/essay types
        "columnA": None,  # For matching types
        "columnB": None,  # For matching types
        "lessonId": lesson_id,
        "unitId": question["unitId"],
        "globalId": global_id,  # New
        "topicId": topic["id"],  # New (numeric)
        "topicName": topic["name"],  # New
        "topicTitle": topic["title"],  # New
        "topicIcon": topic["icon"],  # New
        "topicColor": topic["color"],  # New
    }

def transform_topic(topic_data, global_id_start):
    """Transform a topic and its questions"""
    # Extract numeric id
    topic_id = extract_topic_id(topic_data["unitId"])
    lesson_nodes = build_canonical_nodes(topic_data["unitId"], len(topic_data["questions"]))
    
    # Update topic structure
    topic = {
        "id": topic_id,  # Changed from string to number
        "name": topic_data["name"],
        "title": topic_data["title"],
        "icon": topic_data["icon"],
        "color": topic_data["color"],
        "unitId": topic_data["unitId"],
        "lessonNodes": lesson_nodes,
        "questions": []
    }
    
    # Add backgroundImage if exists
    if "backgroundImage" in topic_data:
        topic["backgroundImage"] = topic_data["backgroundImage"]
    
    # Transform questions
    global_id = global_id_start
    for index, question in enumerate(topic_data["questions"]):
        lesson_id = lesson_id_for_question(index, lesson_nodes)
        transformed_q = transform_question(question, topic, global_id, lesson_id)
        topic["questions"].append(transformed_q)
        global_id += 1
    
    return topic, global_id

def backup_files():
    """Backup original files"""
    print("[BACKUP] Creating backup...")
    BACKUP_DIR.mkdir(exist_ok=True)
    
    for i in range(1, 7):
        src = CHAPTERS_DIR / f"u{i}.json"
        dst = BACKUP_DIR / f"u{i}.json"
        if src.exists():
            dst.write_text(src.read_text(encoding='utf-8'), encoding='utf-8')
    
    # Backup dataset.json if exists
    dataset_src = CHAPTERS_DIR / "dataset.json"
    if dataset_src.exists():
        dataset_dst = BACKUP_DIR / "dataset.json"
        dataset_dst.write_text(dataset_src.read_text(encoding='utf-8'), encoding='utf-8')
    
    print("[OK] Backup completed")

def transform_all_files():
    """Transform all chapter files"""
    print("\n[TRANSFORM] Transforming chapter files...")
    
    # Transform individual chapter files
    for i in range(1, 7):
        file_path = CHAPTERS_DIR / f"u{i}.json"
        if not file_path.exists():
            print(f"[WARN] Skipping u{i}.json (not found)")
            continue
        
        print(f"   Processing {file_path.name}...")
        
        # Read original
        data = json.loads(file_path.read_text(encoding='utf-8'))
        
        # Transform (globalId will be recalculated in dataset generation)
        transformed_topic, _ = transform_topic(data, 0)
        
        # Write back
        file_path.write_text(json.dumps(transformed_topic, ensure_ascii=False, indent=2), encoding='utf-8')
    
    print("[OK] All chapter files transformed")

def generate_dataset():
    """Regenerate dataset.json with correct globalId sequence"""
    print("\n[DATASET] Generating dataset.json...")
    
    topics = []
    global_id = 1
    
    # Read and combine all topics
    for i in range(1, 7):
        file_path = CHAPTERS_DIR / f"u{i}.json"
        if not file_path.exists():
            continue
        
        topic_data = json.loads(file_path.read_text(encoding='utf-8'))
        
        # Recalculate globalId for questions
        for question in topic_data["questions"]:
            question["globalId"] = global_id
            global_id += 1
        
        topics.append(topic_data)
    
    # Create dataset
    dataset = {
        "title": "Trắc nghiệm Lịch Sử 11",
        "subtitle": "Sách Kết Nối Tri Thức – Cả Năm Học",
        "totalQuestions": global_id - 1,
        "topics": topics
    }
    
    # Write dataset
    dataset_path = CHAPTERS_DIR / "dataset.json"
    dataset_path.write_text(json.dumps(dataset, ensure_ascii=False, indent=2), encoding='utf-8')
    
    print(f"[OK] Dataset generated with {len(topics)} topics, {global_id - 1} total questions")

def validate():
    """Validate transformed files"""
    print("\n[VALIDATE] Validating...")
    
    # Check all files are valid JSON
    for i in range(1, 7):
        file_path = CHAPTERS_DIR / f"u{i}.json"
        if file_path.exists():
            try:
                json.loads(file_path.read_text(encoding='utf-8'))
                print(f"   [OK] u{i}.json is valid JSON")
            except json.JSONDecodeError as e:
                print(f"   [ERROR] u{i}.json has JSON error: {e}")
    
    # Validate dataset
    dataset_path = CHAPTERS_DIR / "dataset.json"
    if dataset_path.exists():
        try:
            dataset = json.loads(dataset_path.read_text(encoding='utf-8'))
            total_questions = sum(len(topic["questions"]) for topic in dataset["topics"])
            print(f"   [OK] dataset.json: {len(dataset['topics'])} topics, {total_questions} questions")
            
            # Check globalId sequence
            all_global_ids = []
            for topic in dataset["topics"]:
                for q in topic["questions"]:
                    all_global_ids.append(q["globalId"])
            
            # Check canonical lesson nodes
            for topic in dataset["topics"]:
                nodes = topic.get("lessonNodes", [])
                node_types = [node.get("type") for node in nodes]
                if node_types != CANONICAL_NODE_TYPES:
                    print(f"   [ERROR] {topic['unitId']} node types invalid: {node_types}")
                else:
                    print(f"   [OK] {topic['unitId']} has canonical 7-node path")

            expected = list(range(1, len(all_global_ids) + 1))
            if all_global_ids == expected:
                print(f"   [OK] globalId sequence correct (1 to {len(all_global_ids)})")
            else:
                print(f"   [ERROR] globalId sequence has gaps or duplicates")
        except json.JSONDecodeError as e:
            print(f"   [ERROR] dataset.json has JSON error: {e}")

def main():
    print("[*] Starting chapter transformation...\n")
    
    # Phase 1: Backup
    backup_files()
    
    # Phase 2: Transform
    transform_all_files()
    
    # Phase 3: Generate dataset
    generate_dataset()
    
    # Phase 4: Validate
    validate()
    
    print("\n[OK] Transformation complete!")
    print(f"\n[BACKUP] Backup location: {BACKUP_DIR}")
    print("[INFO] To rollback: Copy files from chapters_backup/ back to chapters/")


if __name__ == "__main__":
    main()
