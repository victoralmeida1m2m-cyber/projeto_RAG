
from services.database import conectar_mongodb
from services.indexacao import indexar_chunks


def main():
    cliente = None

    try:
        print("Conectando ao MongoDB...")

        cliente, banco = conectar_mongodb()

        print("Conexão estabelecida!")

        quantidade = indexar_chunks(banco)

        print(
            f"Indexação finalizada! "
            f"{quantidade} chunks atualizados."
        )

    except Exception as erro:
        print("Erro durante a indexação:")
        print(type(erro).__name__)
        print("Verifique o terminal e as configurações.")

    finally:
        if cliente is not None:
            cliente.close()


if __name__ == "__main__":
    main()
