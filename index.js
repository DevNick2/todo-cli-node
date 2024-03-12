#!/usr/bin/env node

const program = require('commander') // criando os comandos de maneira mais facil
const package = require('./package.json')
const { join } = require('path')
const fs = require('fs')
const todosPath = join(__dirname, 'todos.json') 
const inquirer = require('inquirer') // Criando uma especie de formulario
const chalk = require('chalk') // Inserir cores no terminal
const Table = require('cli-table') // Inserir tabela no retorno dos dados
const shell = require('shelljs') // usando comandos shell
const figlet = require('figlet')

const getJson = (path) =>{
    const data = fs.existsSync(path) ? fs.readFileSync(path) : []

    try {
        return JSON.parse(data)
    } catch (e) {
        return []
    }
}

const saveJson = (path, data) => fs.writeFileSync(path, JSON.stringify(data, null, '\t'))

const showTodoTable = (data)=>{
    const table = new Table({
        head: ['id', 'to-do', 'status'],
        colWidths: [10, 20, 10]
    })
    data.map((todo, index) =>{
        table.push(
            [index, todo.title, todo.done ? chalk.green('feito') : 'pendente']
        )
    })

    console.log(table.toString())
}
program.version(package.version)

console.log(chalk.cyan(figlet.textSync('To-do CLI')))

program
    .command('add [todo]')
    .description('Adiciona um to-do')
    .option('-s, --status [status]', 'Status inicial do to-do')
    .action(async (todo, options)=>{
        let answers
        if(!todo){
            answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'todo',
                    message: 'Qual e seu to-do?',
                    validate: value => value ? true : 'Nao e permitido um to-do vazio'
                }
            ])
        }
        
        const data = getJson(todosPath)
        data.push({
            title: todo || answers.todo,
            done: (options.status === 'true') || false
        })
        saveJson(todosPath,data)

        console.log(`${chalk.green('to-do adicionado com sucesso!')}`)
        
        showTodoTable(data)
    })

program
    .command('list')
    .description('Lista dos to-dos')
    .action(()=>{
        const data = getJson(todosPath)
        showTodoTable(data)
    })

program
    .command('do <todo>')
    .description('Marca o to-do como feito')
    .action(async (todo)=>{
        let answers
        if(!todo){
            answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'todo',
                    message: 'Qual e o id do to-do?',
                    validate: value => value !== undefined ? true : 'Defina um to-do para ser atualizado!'
                }
            ])
        }

        const data = getJson(todosPath)
        data[todo].done = true
        saveJson(todosPath, data)
        
        console.log(`${chalk.green('to-do salvo com sucesso')}`)
        
        showTodoTable(data)
    })


program
    .command('undo <todo>')
    .description('Marca o to-do como nao feito!')
    .action(async (id_todo)=>{
        let answers
        if(!id_todo){
            answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'todo',
                    message: 'Qual e o id do to-do?',
                    validate: value => value !== undefined ? true : 'Defina um to-do para ser atualizado!'
                }
            ])
        }

        const data = getJson(todosPath)
        data[id_todo].done = false
        saveJson(todosPath, data)

        console.log(`${chalk.green('To-do atualizado com sucesso!')}`)

        showTodoTable(data)
    })

program
    .command('backup')
    .description('Realizar backup dos to-do`s')
    .action(()=>{
        shell.mkdir('-p', 'backup')
        const command = shell.cp('./todos.json', './backup/todos.bak.json')

        if(!command.code){
            console.log(chalk.green('Backup realizado com sucesso'))
        }else{
            console.log(command.stderr)
            console.log(chalk.red('Error ao realizar backup.'))
        }
    })

program.parse(process.argv)
