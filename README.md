информация о пользовании ИИ-агента

Запуск бекенда:

Копируем .env.example, создаем секретный ключ и заполняем поле DJANGO_SECRET_KEY:
cp backend/.env.example backend/.env

делать из-под папки backend:
Установка зависимостей:
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Применяем миграции, собираем статику:
python src/manage.py migrate
python src/manage.py collectstatic

Путь к wsgi-приложению: core.wsgi:application 

запуск в режиме разработки:
python src/manage.py runserver



Запуск фронтенд:

Копируем .env.example и заполняем поле NEXT_PUBLIC_API_URL, указывая путь к бекенду
cp frontend/.env.example frontend/.env

делать из-под папки frontend:
запуск production:
Установка:
npm install
npm run build

Запуск:
npm run start

запуск dev:
Установка:
npm install

Запуск:
npm run dev
