interface EquationView {
    displayId: number
    key: string
    display: HTMLElement
}

interface EquationInfo {
    id: number
    key: string
    dom: HTMLElement
}

export default class EquationManager {
    private equations: Map<string, EquationView>
    private recountDelay: ReturnType<typeof setTimeout> | null
    private counter: number

    constructor() {
        this.equations = new Map()
        this.recountDelay = null
        this.counter = 0
    }

    register(key: string, view: EquationView): void {
        const oldCount = this.equations.size
        this.equations.set(key.toString(), view)
        if (oldCount != this.equations.size) {
            this.recount()
        }
    }

    getId(): string {
        const id = `eq${this.counter.toString(16)}`
        this.counter++
        return id
    }

    remove(key: string): void {
        const oldCount = this.equations.size
        this.equations.delete(key.toString())
        if (oldCount != this.equations.size) {
            this.recount()
        }
    }

    recount(): void {
        if (this.recountDelay) {
            clearTimeout(this.recountDelay)
            this.recountDelay = null
        }
        this.recountDelay = setTimeout(() => {
            this.recountDelay = null
            const listOfEquations = document.getElementsByClassName("limpid-equation-counter")
            for (let i = 0; i < listOfEquations.length; ++i) {
                const element = listOfEquations[i] as HTMLElement
                element.innerText = '(' + (i + 1) + ')'
                const key = element.getAttribute('data-key')

                if (key) {
                    const view = this.equations.get(key.toString())
                    if (view) {
                        view.displayId = i + 1
                    }
                }
            }

            const listOfEquationRefs = document.getElementsByClassName("limpid-equation-ref")

            for (let i = 0; i < listOfEquationRefs.length; ++i) {
                const element = listOfEquationRefs[i] as HTMLElement
                const key = element.getAttribute('data-equation-key')

                if (key) {
                    const view = this.equations.get(key.toString())

                    if (view) {
                        element.innerText = 'Eq. ' + (view.displayId)
                    } else {
                        element.innerText = 'Eq. #'
                    }
                }
            }
        }, 1000)
    }

    count(): number {
        return this.equations.size
    }

    getOrderedExistingEquations(): EquationInfo[] {
        const existingEquations: EquationInfo[] = []

        this.equations.forEach((value) => {
            existingEquations.push({
                id: value.displayId,
                key: value.key,
                dom: value.display.cloneNode(true) as HTMLElement
            })
        })

        existingEquations.sort((a, b) => {
            if (a.id < b.id) {
                return -1
            }
            else if (a.id > b.id) {
                return 1
            }
            return 0
        })

        console.log("order", existingEquations)

        return existingEquations
    }

    fetchCountByKey(key: string): string | number {
        const equation = this.equations.get(key.toString())
        if (equation) {
            return equation.displayId
        }
        else {
            return '#'
        }
    }
}