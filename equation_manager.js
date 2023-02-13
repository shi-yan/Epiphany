
export default class EquationManager {
    constructor() {
        this.equations = new Map();
        this.recountDelay = null;
    }

    register(key, view) {
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
            for (let i = 0; i < listOfEquations.length; ++i) {
                listOfEquations[i].innerText = '(' + (i + 1) + ')';
                let key = listOfEquations[i].getAttribute('data-key');

                let view = this.equations.get(key.toString());
                if (view) {
                    view.displayId = i + 1;
                }
            }

            let listOfEquationRefs = document.getElementsByClassName("limpid-equation-ref");

            for (let i = 0; i < listOfEquationRefs.length; ++i) {
                let key = listOfEquationRefs[i].getAttribute('data-equation-key');

                let view = this.equations.get(key.toString());

                if (view) {

                    listOfEquationRefs[i].innerText = 'Eq. ' + (view.displayId);
                } else {
                    listOfEquationRefs[i].innerText = 'Eq. #';
                }
            }
        }, 1000);
    }

    assembleSelector(dom, insertEquationRef) {
        let exisitingEquations = [];

        this.equations.forEach((value, key, map) => {
            exisitingEquations.push({
                id: value.displayId,
                key: value.key,
                dom: value.display.cloneNode(true)
            })
        })

        exisitingEquations.sort((a, b) => {
            if (a.id < b.id) {
                return -1;
            }
            else if (a.id > b.id) {
                return 1;
            }
            return 0;
        })

        console.log("order", exisitingEquations);

        exisitingEquations.forEach((value, index, array) => {
            let container = document.createElement('button');
            container.className = 'limpid-equation-ref-selector-item';

            let count = document.createElement('span');
            count.innerText = '(' + value.id + ')';
            container.appendChild(count);

            container.appendChild(value.dom);

            container.onclick = (e) => { insertEquationRef(value.key) }

            //value.dom.classList.remove('limpid-equation-display');
            value.dom.className = 'limpid-equation-ref-selector-display';

            dom.appendChild(container);
        })
    }

    fetchCountByKey(key) {
        let equation = this.equations.get(key.toString());
        if (equation) {
            return equation.displayId
        }
        else {
            return '#';
        }
    }
}