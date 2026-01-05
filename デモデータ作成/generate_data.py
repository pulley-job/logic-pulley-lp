import csv
import random
import os

# 設定
output_dir = "/Users/furuimasaya/Desktop/LogicPulley/デモデータ作成/mock_csv_data"
subjects = ["専門基礎", "運動学", "臨床心理学", "リハ概論", "生理学", "解剖学"]
headers = ["クラス", "ID", "氏名", "学生Mail", "保護者Mail"] + subjects

# 生徒データ (10名)
students = [
    {"class": "3FA", "id": "2024001", "name": "佐藤 健一", "email": "student01@example.com"},
    {"class": "3FA", "id": "2024002", "name": "鈴木 花子", "email": "student02@example.com"},
    {"class": "3FA", "id": "2024003", "name": "高橋 大輔", "email": "student03@example.com"},
    {"class": "3FA", "id": "2024004", "name": "田中 美咲", "email": "student04@example.com"},
    {"class": "3FA", "id": "2024005", "name": "伊藤 翔太", "email": "student05@example.com"},
    {"class": "3FB", "id": "2024006", "name": "渡辺 明日香", "email": "student06@example.com"},
    {"class": "3FB", "id": "2024007", "name": "山本 陸", "email": "student07@example.com"},
    {"class": "3FB", "id": "2024008", "name": "中村 結衣", "email": "student08@example.com"},
    {"class": "3FB", "id": "2024009", "name": "小林 翼", "email": "student09@example.com"},
    {"class": "3FB", "id": "2024010", "name": "加藤 さくら", "email": "student10@example.com"}
]

# 10回分のデータ生成
for i in range(1, 11):
    filename = f"exam{i:02d}.csv"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for student in students:
            # 回が進むごとに基礎点を上げる (成長曲線)
            base_score = 50 + (i * 3) + random.randint(-5, 5) # 第1回=53点前後 -> 第10回=80点前後
            
            scores = []
            for _ in subjects:
                # 科目ごとのばらつき
                score = base_score + random.randint(-10, 15)
                score = max(0, min(100, score)) # 0-100の範囲に収める
                scores.append(score)
            
            row = [
                student["class"],
                student["id"],
                student["name"],
                student["email"],
                f"parent_{student['email']}" # 保護者メアド(ダミー)
            ] + scores
            writer.writerow(row)

print(f"Created 10 CSV files in {output_dir}")
