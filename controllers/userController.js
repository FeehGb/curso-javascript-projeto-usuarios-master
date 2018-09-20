class UserController {

    constructor(formId, tableId) {

        //Atribui a varialve formEl o meu formulario form-user-create
        this.formEl = document.getElementById(formId);
        //Atribuie a variavel tableId onde sera aplicado minha lista table-users
        this.tableId = document.getElementById(tableId);
        //Executa o submit
        this.onSubmit();
    }

    /**
     * Metodo para enivar os dados e escrever minha tabela
     */
    onSubmit() {

        // Evento Submit do formulario
        this.formEl.addEventListener('submit', event => {
            event.preventDefault()

            //Retorna os valores do form-user-create
            let values = this.getValues();

            this.getPhoto().then(
                 (content) =>{

                    values.photo = content;
                this.addLine(values);
                },
                 (e) =>{
                    console.error(e);
                }
            )

            this.getPhoto(content => {

                
            });




        })
    }


    getPhoto() {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();
            let elements = [...this.formEl.elements].filter(item => {
             
                if (item.name === 'photo') {
                    return item;
                }
            });

            debugger;
            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result)
            }
            fileReader.onerror = (e) => {
                reject(e);
            }

            fileReader.readAsDataURL(file);

        })

    }


    /**
     * Captura Todos os valores do meu formulario
     */
    getValues() {


        let user = {};
        [...this.formEl.elements].forEach(function (field, index) {
            
            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.value;
                }

            } else {
                user[field.name] = field.value;
            }

        });


        return new User(
            user.name,
            user.gender,
            user.birth,
            user.county,
            user.email,
            user.photo,
            user.admin
        );

    }


    addLine(dataUser) {


        this.tableId.innerHTML =
            `
        <tr>
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin}</td>
            <td>${dataUser.birth}</td>
            <td>
            <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        </tr>
        `;

    }

}

