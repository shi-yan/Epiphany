
export default class EquationManager {
    constructor() {
        this.equations = new Map();
        this.recountDelay = null;
    }

    register(key, view){
        let oldCount = this.equations.size;
        this.equations.set(key.toString(), view);
        if (oldCount != this.equations.size) {
            this.recount();
        }
    }

    remove(key) {
        let oldCount = this.equations.size;
        this.equations.delete(key.toString());
        if (oldCount != this.equations.size) {
            this.recount();
        }
    }

    recount() {
        if (this.recountDelay) {
            clearTimeout(this.recountDelay);
            this.recountDelay = null;
        }
        console.log("recount");
        this.recountDelay = setTimeout(() => {
            this.recountDelay = null;
            let listOfEquations = document.getElementsByClassName("limpid-equation-counter");
            console.log("actual recount", listOfEquations)
            for (let i =0;i<listOfEquations.length;++i) {
                listOfEquations[i].innerText = '(' + (i+1) +')';
                let key = listOfEquations[i].getAttribute('data-key');
                
                let view = this.equations.get(key);
                view.displayId = i+1;
            }
        }, 1000);
    }

    assembleSelector(dom) {
        let exisitingEquations = [];

        this.equations.forEach((value, key , map) => {
            exisitingEquations.push({
                id: value.displayId,
                dom: value.display.cloneNode(true)
            })
        })

        exisitingEquations.sort((a,b) => {
            return a.id < b.id;
        })

        exisitingEquations.forEach((value, index, array) => {
            let container = document.createElement('div');
            
            container.style.display='flex';
            container.style.flexDirection='row';
            
            let count = document.createElement('span');
            count.innerText = '(' +value.id+ ')';
            container.appendChild(count);

            container.appendChild(value.dom);
            value.dom.style.display = 'inline-block';

            dom.appendChild(container);
        })
    }
}