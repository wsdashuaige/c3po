import os
import hashlib
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)

# 配置 CORS，允许跨域请求
CORS(app, resources={
    r"/api/v1/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 确保上传目录存在
UPLOAD_FOLDER = './uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def calculate_file_hash(file_data):
    """计算文件 hash，返回前 32 个字符（缩减一半）"""
    return hashlib.sha256(file_data).hexdigest()[:32]

# 获取文件扩展名
def get_file_extension(filename):
    return os.path.splitext(filename)[1] if filename else ''

@app.route('/api/v1/files/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    """上传任意类型的文件"""
    if request.method == 'OPTIONS':
        return '', 200
    
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400
    
    # 读取文件数据
    file_data = file.read()
    
    # 计算文件的 hash（缩减一半长度）
    file_hash = calculate_file_hash(file_data)
    
    # 获取文件扩展名
    extension = get_file_extension(file.filename)
    
    # 生成新的文件名
    new_filename = f"{file_hash}{extension}"
    file_path = os.path.join(UPLOAD_FOLDER, new_filename)
    
    # 检查文件是否已存在（去重）
    if not os.path.exists(file_path):
        # 保存文件
        with open(file_path, 'wb') as f:
            f.write(file_data)
    
    # 返回成功响应
    return jsonify({"success": True, "url": new_filename, "filename": new_filename})

@app.route('/api/v1/files/<filename>', methods=['GET', 'OPTIONS'])
def get_file(filename):
    """获取任意类型的文件"""
    if request.method == 'OPTIONS':
        return '', 200
    
    # 检查文件是否存在
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"success": False, "error": "File not found"}), 404
    
    # 返回文件
    return send_from_directory(UPLOAD_FOLDER, filename)

# 保持向后兼容：保留原有的图片上传接口
@app.route('/api/v1/images/upload', methods=['POST', 'OPTIONS'])
def upload_image():
    """上传图片文件（向后兼容）"""
    return upload_file()

@app.route('/api/v1/images/<filename>', methods=['GET', 'OPTIONS'])
def get_image(filename):
    """获取图片文件（向后兼容）"""
    return get_file(filename)

def main():
    # 启动Flask应用
    app.run(host='0.0.0.0', port=5000)

if __name__ == "__main__":
    main()
