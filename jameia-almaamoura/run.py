#!/usr/bin/env python3
from app import create_app

app = create_app()

if __name__ == '__main__':
    print("=" * 60)
    print("🏛️  Al Maamoura Association Management System")
    print("=" * 60)
    print("🌐 Starting server at: http://localhost:5000")
    print("🌍 Supported languages: English (default), Arabic, French")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
