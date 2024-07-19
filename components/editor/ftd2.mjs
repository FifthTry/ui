// till now ftd took over the entire document window. now we are going
// to only take over the `node`. earlier we stored global data in a
// window.ftd.globals or something, now we are going to store it on the
// node itself. this way we can have multiple ftd instances on the same
// page. the get and set functions will have to pass the id of the node.
export function initialise(node, ctor, props) {
    preact.render(preact.h(ctor, props), node);
}

export const set_value = (id, key, value) => {
    let node = document.getElementById(id);
    node.ftd_globals[key].set(value);
}

export const get_value = (id, key) => {
    let node = document.getElementById(id);
    return node.ftd_globals[key].get();
}

class FastnTik {
    #value
    #setter

    constructor(value, node, global_key) {
        [this.#value, this.#setter] = hooks.useState(value);
        if (global_key !== undefined) {
            window.ftd_internals.globals[global_key] = this;
        }
    }

    get() {
        // we intentionally do not look in modifications as get is safe to return
        // the value of a variable at the beginning of the rendering cycle. all
        // mutations will be batched together and will be visible in the next cycle.
        return this.#value;
    }

    set(new_value) {
        this.set_key([], new_value)
    }

    set_key(key, new_value) {
        if (key.length === 0) {
            this.#setter(new_value);
            return;
        }

        let f = this.#value;
        let i = 0;

        for (; i < key.length - 1; i++) {
            f = f[key[i]];
        }

        f[key[i]] = new_value; // the last element

        // if we do not clone the object, the setter doesn't trigger re-render.
        if (!!structuredClone) {
            this.#setter(structuredClone(this.#value));
        } else {
            this.#setter(JSON.parse(JSON.stringify(this.#value)));
        }


        // earlier we had a ctx tracking based approach, where we also passed
        // a ctx object. the ctx was created in the main().

        // this approach does not work, because main is not called on every
        // re-render. say if a node somewhere down the tree has a tik, and
        // that tik changes, only that part of that tree will be updated, so
        // it will keep the wrong ctx.
        //
        // there are many cases where we want to do many updates to state on
        // the same click handler. e.g., say on form submit we want to clear
        // each field, and also add a new record to a list.
        //
        // why are we bothering with this ctx: consider in an update we did
        // both these operations, update a list, and update a member of this
        // list, by two independent operations (both $on-click$ on the same
        // node).
        //
        // so these two operations are order-dependent, since we store keys,
        // your intention was to update the n element of the last list, so
        // update nth list element happened first, and then the list was
        // replaced with a new list; we will see one outcome. but if the list
        // was replaced first, and then we went and merrily tried to update
        // the nth element, we will see a different outcome. the new list may
        // not even have n elements. or the set operation you wanted to do
        // on the nth element was to make its one field equal to another
        // field. but since the old list is replaced, and the "another field"
        // in the new list has a different value, the outcome will be wrong.
        //
        // now we do not have commit stage, where we can go and apply all
        // the accumulated changes. so we have to apply them as we go.
        //
        // another thought I considered was to apply all the changes as they
        // come and still keep ctx around, and issue a warning for the kind
        // of change I described earlier (list element change concurrent
        // with list change). but this is not a good idea, because the
        // ctx will not be re-created unless main is called again, which it
        // won't be unless a global changes. so the ctx will keep growing,
        // and we will have false positives.
    }

    index(idx) {
        return new FastnTok(this, [], idx, this.#value);
    }

    map(fn) {
        if (!Array.isArray(this.#value)) {
            console.log(this.#value);
            throw new Error("map called on a non list");
        }

        // create a tok for every member of the list and pass that tok to the
        // function, and collect the results
        let result = [];
        let i = 0;
        for (; i < this.#value.length; i++) {
            result.push(fn(this.index(i)));
        }

        return result;
    }
}

class FastnTok {
    #tik
    #idx
    #value

    // consider this constructor private. only {tik,tok}.index() should be used.
    constructor(tik, idx_so_far, idx, parent) {
        if (!tik instanceof FastnTik) {
            console.log(tik);
            throw new Error("tik must be an instance of FastnTik");
        }
        if (!Array.isArray(idx_so_far)) {
            console.log(idx);
            throw new Error("idx must be an array");
        }
        if (typeof idx !== "number" && typeof idx !== "string") {
            console.log(idx);
            throw new Error("idx must be a number or string");
        }
        this.#tik = tik;
        this.#idx = idx_so_far.concat(idx);
        this.#value = parent[idx];
    }

    get() {
        return this.#value;
    }

    set(new_value) {
        this.#tik.set_key(this.#idx, new_value);
    }

    index(idx) {
        return new FastnTok(this.#tik, this.#idx, idx, this.#value);
    }

    map(fn) {
        if (!Array.isArray(this.#value)) {
            console.log(this);
            throw new Error("map called on a non list");
        }

        // create a tok for every member of the list and pass that tok to the
        // function, and collect the results
        let result = [];
        let i = 0;
        for (; i < this.#value.length; i++) {
            result.push(fn(this.index(i)));
        }

        return result;
    }
}
