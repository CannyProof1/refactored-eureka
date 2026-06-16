import sqlite3
import os

DB_PATH = 'medical.db'


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            diagnosis TEXT,
            phone TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()


def add_patient(name, age, diagnosis, phone, status='active'):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO patients (name, age, diagnosis, phone, status)
        VALUES (?, ?, ?, ?, ?)
    ''', (name, age, diagnosis, phone, status))

    patient_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return patient_id


def get_all_patients():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM patients ORDER BY created_at DESC')
    patients = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return patients


def get_patient(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM patients WHERE id = ?', (patient_id,))
    patient = cursor.fetchone()

    conn.close()
    return dict(patient) if patient else None


def update_patient(patient_id, name, age, diagnosis, phone, status):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE patients 
        SET name = ?, age = ?, diagnosis = ?, phone = ?, status = ?
        WHERE id = ?
    ''', (name, age, diagnosis, phone, status, patient_id))

    conn.commit()
    conn.close()


def delete_patient(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM patients WHERE id = ?', (patient_id,))

    conn.commit()
    conn.close()