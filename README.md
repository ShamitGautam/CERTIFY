# Student Certificate Verification System using Blockchain

## Overview

The Student Certificate Verification System is a web-based application that uses blockchain technology to securely store and verify academic certificates.
It ensures that certificates cannot be tampered with and can be verified instantly.

---

## Features

* Secure certificate storage using hashing (SHA-256)
* Blockchain-based data integrity
* Upload and store certificates
* Instant certificate verification
* Admin and user roles
* Tamper-proof system

---

## How It Works

1. Admin uploads a certificate
2. System generates a hash of the certificate
3. Hash is stored in a blockchain block
4. User uploads certificate for verification
5. System compares hashes
6. Displays result: Valid / Fake

---

## System Architecture

Frontend → Backend → Blockchain → Database

---

## Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: Python (Flask)
* Blockchain: Custom Blockchain (Python)
* Database: SQLite / PostgreSQL

---

## Project Structure

```
project/
│── app.py
│── blockchain.py
│── templates/
│── static/
│── database.db
│── README.md
```

---

## Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies

```
pip install -r requirements.txt
```

### 3. Run the application

```
python app.py
```

### 4. Open in browser

```
http://127.0.0.1:5000/
```

---

## User Roles

### Admin

* Upload certificates
* Approve certificates
* Add data to blockchain

### User

* Verify certificates

---

## Key Concepts Used

* Blockchain
* Cryptographic Hashing (SHA-256)
* Data Integrity
* Decentralization (Simulated)



## Future Enhancements

* QR code-based verification
* Integration with Ethereum blockchain
* Mobile application
* Multi-user authentication system

---

## Use Case

* Educational institutions
* Employers verifying candidate certificates
* Government verification systems

---

## Acknowledgements

* Blockchain technology concepts
* Open-source community

---

## License

This project is for educational purposes.
