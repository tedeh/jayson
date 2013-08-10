all: agent1-cert.pem ca1-cert.pem

ca1-cert.pem: ca1.cnf
	openssl req -new -x509 -days 9999 -config ca1.cnf -keyout ca1-key.pem -out ca1-cert.pem

agent1-key.pem:
	openssl genrsa -out agent1-key.pem 1024

agent1-csr.pem: agent1.cnf agent1-key.pem
	openssl req -new -config agent1.cnf -key agent1-key.pem -out agent1-csr.pem

agent1-cert.pem: agent1-csr.pem ca1-cert.pem ca1-key.pem
	openssl x509 -req \
		-days 9999 \
		-passin "pass:password" \
		-in agent1-csr.pem \
		-CA ca1-cert.pem \
		-CAkey ca1-key.pem \
		-CAcreateserial \
		-out agent1-cert.pem

.PHONY: all ca1-cert.pem agent1-key.pem agent1-csr.pem agent1-cert.pem
