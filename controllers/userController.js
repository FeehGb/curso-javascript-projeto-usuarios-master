class UserController {

    constructor(formIdCreate,formIdUpdate, tableId) {

        //Atribui a varialve formEl o meu formulario form-user-create
        this.formEl = document.getElementById(formIdCreate);
        //Atribuie a variavel tableId onde sera aplicado minha lista table-users
        this.tableEl = document.getElementById(tableId);
        
        this.formIdUpdateEl = document.getElementById(formIdUpdate);

        //Executa o submit
        this.onSubmit();
        this.onEdit();
        //this.metodoTeste();
        this.selectAll();
    }


    onEdit(){
        this.showPanelCreate();
        document.querySelector("#box-user-update .btn-cancel").addEventListener('click', e =>{
            this.showPanelCreate();
        });

        this.formIdUpdateEl.addEventListener('submit',(event)=>{
            event.preventDefault();
            let btn = this.formIdUpdateEl.querySelector('[type=submit]')
            btn.disable = true;

            let values = this.getValues(this.formIdUpdateEl);

            let index = this.formIdUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];
            
            let userOld = JSON.parse(tr.dataset.user);
            let result = Object.assign({},userOld,values);


                this.getPhoto(this.formIdUpdateEl).then(
                    (content) =>{
                        if(!values.photo){
                            result._photo = userOld._photo
                        } else{
                            result._photo =content;
                        }

                        let user = new User();

                        user.loadFromJSON(result);

                        user.save()
                        
                        this.getTr(user, tr);
                        
                        this.updateCount();
                   
                    this.formIdUpdateEl.reset();
                    this.showPanelCreate();
                    btn.disable = false;
   
   
                   },
                    (e) =>{
                       console.error(e);
                   }
               )
        })

    }

    /**
     * Metodo para enivar os dados e escrever minha tabela
     */
    onSubmit() {

        // Evento Submit do formulario
        this.formEl.addEventListener('submit', event => {
            event.preventDefault();

            let btn = this.formEl.querySelector('[type=submit]')
            btn.disable = true;

            // Retorna os valores do form-user-create e passa para variavel values
            let values = this.getValues(this.formEl);
            // Se values estiver vazio cancela o envio
            if(!values) return false;

            // Pega a foto e cria a novo registo na tabela
            this.getPhoto(this.formEl).then(
                 (content) =>{

                values.photo = content;

                values.save();

                this.addLine(values);

                this.formEl.reset();
                btn.disable = false;


                },
                 (e) =>{
                    console.error(e);
                }
            )
        })
    }

  
    /**
     * Metodo para carregar pre visualizaçao da imagem
     */
    getPhoto(formEl) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();
            let elements = [...formEl.elements].filter(item => {
             
                if (item.name === 'photo') {
                    return item;
                }
            });

            
            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result)
            }
            fileReader.onerror = (e) => {
                reject(e);
            }

            if(file){
                fileReader.readAsDataURL(file);
            }else{
                resolve('dist/img/avatar2.png');
            }
        })

    }


    /**
     * Captura Todos os valores do meu formulario
     */
    getValues(formEl) {

        
        let user = {};
        let isValid = true;
        [...formEl.elements].forEach( (field, index)=> {

            if(['name','email','password'].indexOf(field.name) > -1 && !field.value){
                    
                field.parentElement.classList.add('has-error')
                isValid = false;
                
            }
            
            if (field.name == "gender") {
               
                if (field.checked) {
                    user[field.name] = field.value;
                }

            } else if(field.name == 'admin') {
                user[field.name] = field.checked;


            }else{
                user[field.name] = field.value;
            }

            

        });

        if(!isValid){
            return false;
        }
        return new User(
            user.name,
            user.gender,
            user.birth,
            user.county,
            user.email,
            user.password,
            user.photo,
            user.admin,
            
        );

    }


    selectAll(){
        
        let users = User.getUsersStorage();
        
        users.forEach(dataUser =>{

            let user =  new User();
            user.loadFromJSON(dataUser);

            this.addLine(user);
        })

    }

    /**
     * // Cria linha de acordo com os dados recebidos
     * @param {*Adciona uma nova linha do fim da Tabele} dataUser 
     */
    addLine(dataUser) {
        
        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr)

        this.updateCount();
    }

    getTr(dataUser, tr = null){
        
        
        if (tr === null)tr = document.createElement('tr');
        tr.dataset.user = JSON.stringify(dataUser);
        tr.innerHTML =
            `
        <tr>
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? 'Sim': 'Não'}</td>
            <td>${Utils.dataFormat(dataUser.register)}</td>
            <td>
            <button type="button" class="btn-edit btn btn-primary btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
            </td>
        </tr>
        `;

        this.addEventsTR(tr);
        return tr;
    }

    addEventsTR(tr){
   
        tr.querySelector('.btn-delete').addEventListener('click', e => {
            
            if(confirm('deseja realmente excluir')){

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove();

                tr.remove();
                this.updateCount();
            }

        });


        
        tr.querySelector('.btn-edit').addEventListener('click', e => {
                
            let json = JSON.parse(tr.dataset.user);
            
            this.formIdUpdateEl.dataset.trIndex = tr.sectionRowIndex;
            
            
            for (let name in json){

                1
                
                let field = this.formIdUpdateEl.querySelector(`[name=${name.replace('_',"")}]`);

                if(field){
                   
                    switch(field.type){
                        case 'file':
                        continue;
                        break;
                        case 'radio':
                            field = this.formIdUpdateEl.querySelector(`[name=${name.replace('_',"")}][value=${json[name]}]`);
                            field.checked = true;
                        break;
                        case 'checkbox':
                            field.checked =  json[name];
                        break;
                        default:
                            field.value = json[name];
                      
                    }

                    
                }
            }
            this.formIdUpdateEl.querySelector('.photo').src = json._photo
            this.showPanelUpdate();
    });

    }

    showPanelCreate(){
        document.querySelector('#box-user-create').style.display = 'block';
        document.querySelector('#box-user-update').style.display = 'none';
    }

    showPanelUpdate(){
        document.querySelector('#box-user-create').style.display = 'none';
        document.querySelector('#box-user-update').style.display = 'block';
    }
    /**
     * Atualiza o numero de usuarios e de Administrador
     */
    updateCount(){
        
        let numberUser  = 0;
        let numberAdmin = 0;
        [...this.tableEl.children].forEach(tr =>{
            numberUser++
            let user = JSON.parse(tr.dataset.user);
           
            if(user._admin) numberAdmin++;
        })

        document.querySelector('#number-users').innerHTML = numberUser;
        document.querySelector('#number-users-admin').innerHTML = numberAdmin;

    }

 /*   metodoTeste(){
        
        // Pega o elemento onde estao as Checkbox
        let field =  document.getElementById('admin-check');
        // Seleciona todas as checboxs
        let checkboxs = field.querySelectorAll('input[type=checkbox]');
        

        //let closeParent = checkboxs.closest('body');
        console.dir(checkboxs);


        // Percorre todas as checkbox
        checkboxs.forEach(( checkbox , index )=>{
            
            checkbox.addEventListener('change',(event) =>{
                
                // Verefica qual foi a checkbox clicada e atribui ao i o indice da outra
                let i = index == 1 ? 0: 1;

                // Se a checkbox esta selecionada e clicar nela de novo desativa ela mesma
                if(!checkbox.checked){

                    checkbox.checked = false;

                  }else{
                    // Se o id da checkbox clicada for igual ao que pertence ao Loop
                    // Elas se torna checado
                    // e a outra se torna  desverificado
                    if(checkbox.id == checkboxs[index].id){
                        
                        checkboxs[index].checked = true;
                        checkboxs[i].checked = false;

                    }
                
             }
                 

            })
        })

    }*/

}



