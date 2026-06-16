from flask import Flask, render_template, request, jsonify, redirect, url_for
from database import init_db, add_patient, get_all_patients, get_patient, update_patient, delete_patient
import json

app = Flask(__name__)

# Инициализация базы данных
init_db()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = get_all_patients()
    return jsonify(patients)


@app.route('/api/patient', methods=['POST'])
def add_patient_route():
    data = request.json
    name = data.get('name')
    age = data.get('age')
    diagnosis = data.get('diagnosis')
    phone = data.get('phone')
    status = data.get('status', 'active')

    if not name or not age:
        return jsonify({'error': 'Имя и возраст обязательны'}), 400

    patient_id = add_patient(name, age, diagnosis, phone, status)
    return jsonify({'id': patient_id, 'message': 'Пациент добавлен'}), 201


@app.route('/api/patient/<int:patient_id>', methods=['PUT'])
def update_patient_route(patient_id):
    data = request.json
    name = data.get('name')
    age = data.get('age')
    diagnosis = data.get('diagnosis')
    phone = data.get('phone')
    status = data.get('status')

    update_patient(patient_id, name, age, diagnosis, phone, status)
    return jsonify({'message': 'Пациент обновлен'})


@app.route('/api/patient/<int:patient_id>', methods=['DELETE'])
def delete_patient_route(patient_id):
    delete_patient(patient_id)
    return jsonify({'message': 'Пациент удален'})


@app.route('/api/patient/<int:patient_id>', methods=['GET'])
def get_patient_route(patient_id):
    patient = get_patient(patient_id)
    if patient:
        return jsonify(patient)
    return jsonify({'error': 'Пациент не найден'}), 404


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)