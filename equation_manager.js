
export default class EquationManager {
    constructor() {
        this.equations = new Map();
        this.recountDelay = null;
    }

    register(key, view){
        let oldCount = this.equations.size;
        this.equations.set(key, view);
        if (oldCount != this.equations.size) {
            this.recount();
        }
        console.log('register equation view', key, view, oldCount, this.equations.size);

    }

    remove(key) {
        let oldCount = this.equations.size;
        this.equations.delete(key);
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
            }

        }, 1000);
    }
}