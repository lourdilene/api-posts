
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/groups/Request.svelte generated by Svelte v3.38.2 */

    const file = "src/components/groups/Request.svelte";

    function create_fragment(ctx) {
    	let a;
    	let strong;
    	let t0_value = /*request*/ ctx[0].method + "";
    	let t0;
    	let strong_class_value;
    	let t1;
    	let span;
    	let t2_value = /*request*/ ctx[0].name + "";
    	let t2;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(strong, "class", strong_class_value = /*request*/ ctx[0].method.toLowerCase());
    			add_location(strong, file, 5, 2, 101);
    			add_location(span, file, 6, 2, 174);
    			attr_dev(a, "href", a_href_value = "#" + /*request*/ ctx[0]._id);
    			attr_dev(a, "class", "sidebar-list-link name");
    			add_location(a, file, 4, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, strong);
    			append_dev(strong, t0);
    			append_dev(a, t1);
    			append_dev(a, span);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*request*/ 1 && t0_value !== (t0_value = /*request*/ ctx[0].method + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*request*/ 1 && strong_class_value !== (strong_class_value = /*request*/ ctx[0].method.toLowerCase())) {
    				attr_dev(strong, "class", strong_class_value);
    			}

    			if (dirty & /*request*/ 1 && t2_value !== (t2_value = /*request*/ ctx[0].name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*request*/ 1 && a_href_value !== (a_href_value = "#" + /*request*/ ctx[0]._id)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Request", slots, []);
    	let { request } = $$props;
    	const writable_props = ["request"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Request> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("request" in $$props) $$invalidate(0, request = $$props.request);
    	};

    	$$self.$capture_state = () => ({ request });

    	$$self.$inject_state = $$props => {
    		if ("request" in $$props) $$invalidate(0, request = $$props.request);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [request];
    }

    class Request extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { request: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Request",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*request*/ ctx[0] === undefined && !("request" in props)) {
    			console.warn("<Request> was created without expected prop 'request'");
    		}
    	}

    	get request() {
    		throw new Error("<Request>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set request(value) {
    		throw new Error("<Request>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/groups/Group.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/components/groups/Group.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (15:0) {#if !root}
    function create_if_block_1(ctx) {
    	let span1;
    	let span0;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			t = text(/*name*/ ctx[2]);
    			add_location(span0, file$1, 16, 4, 328);
    			attr_dev(span1, "class", "sidebar-list-link name svelte-dbizbl");
    			toggle_class(span1, "expanded", /*expanded*/ ctx[0]);
    			add_location(span1, file$1, 15, 2, 253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);
    			append_dev(span0, t);

    			if (!mounted) {
    				dispose = listen_dev(span1, "click", /*toggle*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) set_data_dev(t, /*name*/ ctx[2]);

    			if (dirty & /*expanded*/ 1) {
    				toggle_class(span1, "expanded", /*expanded*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:0) {#if !root}",
    		ctx
    	});

    	return block;
    }

    // (21:0) {#if expanded}
    function create_if_block(ctx) {
    	let ul;
    	let t;
    	let current;
    	let each_value_1 = /*children*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*requests*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-dbizbl");
    			add_location(ul, file$1, 21, 2, 382);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			append_dev(ul, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 8) {
    				each_value_1 = /*children*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(ul, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*requests*/ 16) {
    				each_value = /*requests*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(21:0) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#each children as child}
    function create_each_block_1(ctx) {
    	let li;
    	let group;
    	let current;
    	const group_spread_levels = [/*child*/ ctx[9]];
    	let group_props = {};

    	for (let i = 0; i < group_spread_levels.length; i += 1) {
    		group_props = assign(group_props, group_spread_levels[i]);
    	}

    	group = new Group({ props: group_props, $$inline: true });

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(group.$$.fragment);
    			attr_dev(li, "class", "folder");
    			add_location(li, file$1, 23, 6, 423);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(group, li, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const group_changes = (dirty & /*children*/ 8)
    			? get_spread_update(group_spread_levels, [get_spread_object(/*child*/ ctx[9])])
    			: {};

    			group.$set(group_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(group.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(group.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(group);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(23:4) {#each children as child}",
    		ctx
    	});

    	return block;
    }

    // (26:4) {#each requests as request}
    function create_each_block(ctx) {
    	let li;
    	let request;
    	let current;

    	request = new Request({
    			props: { request: /*request*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(request.$$.fragment);
    			attr_dev(li, "class", "request");
    			add_location(li, file$1, 26, 6, 524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(request, li, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const request_changes = {};
    			if (dirty & /*requests*/ 16) request_changes.request = /*request*/ ctx[6];
    			request.$set(request_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(request.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(request.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(request);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:4) {#each requests as request}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = !/*root*/ ctx[1] && create_if_block_1(ctx);
    	let if_block1 = /*expanded*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*root*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*expanded*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*expanded*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Group", slots, []);
    	let { root = false } = $$props;
    	let { expanded = false } = $$props;
    	let { name } = $$props;
    	let { children } = $$props;
    	let { requests } = $$props;

    	function toggle() {
    		$$invalidate(0, expanded = !expanded);
    	}

    	const writable_props = ["root", "expanded", "name", "children", "requests"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Group> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("children" in $$props) $$invalidate(3, children = $$props.children);
    		if ("requests" in $$props) $$invalidate(4, requests = $$props.requests);
    	};

    	$$self.$capture_state = () => ({
    		Request,
    		root,
    		expanded,
    		name,
    		children,
    		requests,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("children" in $$props) $$invalidate(3, children = $$props.children);
    		if ("requests" in $$props) $$invalidate(4, requests = $$props.requests);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [expanded, root, name, children, requests, toggle];
    }

    class Group extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			root: 1,
    			expanded: 0,
    			name: 2,
    			children: 3,
    			requests: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Group",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[2] === undefined && !("name" in props)) {
    			console.warn("<Group> was created without expected prop 'name'");
    		}

    		if (/*children*/ ctx[3] === undefined && !("children" in props)) {
    			console.warn("<Group> was created without expected prop 'children'");
    		}

    		if (/*requests*/ ctx[4] === undefined && !("requests" in props)) {
    			console.warn("<Group> was created without expected prop 'requests'");
    		}
    	}

    	get root() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get requests() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set requests(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Sidebar.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/components/Sidebar.svelte";

    function create_fragment$2(ctx) {
    	let aside;
    	let group;
    	let current;

    	group = new Group({
    			props: {
    				name: /*workspace*/ ctx[2].name,
    				children: /*groups*/ ctx[1],
    				requests: /*requests*/ ctx[0],
    				root: true,
    				expanded: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			create_component(group.$$.fragment);
    			attr_dev(aside, "class", "svelte-dekk65");
    			toggle_class(aside, "visible", /*visible*/ ctx[3]);
    			add_location(aside, file$2, 28, 0, 398);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			mount_component(group, aside, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const group_changes = {};
    			if (dirty & /*workspace*/ 4) group_changes.name = /*workspace*/ ctx[2].name;
    			if (dirty & /*groups*/ 2) group_changes.children = /*groups*/ ctx[1];
    			if (dirty & /*requests*/ 1) group_changes.requests = /*requests*/ ctx[0];
    			group.$set(group_changes);

    			if (dirty & /*visible*/ 8) {
    				toggle_class(aside, "visible", /*visible*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(group.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(group.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			destroy_component(group);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sidebar", slots, []);
    	let { requests } = $$props;
    	let { groups } = $$props;
    	let { workspace } = $$props;
    	let { visible } = $$props;
    	const writable_props = ["requests", "groups", "workspace", "visible"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("requests" in $$props) $$invalidate(0, requests = $$props.requests);
    		if ("groups" in $$props) $$invalidate(1, groups = $$props.groups);
    		if ("workspace" in $$props) $$invalidate(2, workspace = $$props.workspace);
    		if ("visible" in $$props) $$invalidate(3, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({
    		Group,
    		requests,
    		groups,
    		workspace,
    		visible
    	});

    	$$self.$inject_state = $$props => {
    		if ("requests" in $$props) $$invalidate(0, requests = $$props.requests);
    		if ("groups" in $$props) $$invalidate(1, groups = $$props.groups);
    		if ("workspace" in $$props) $$invalidate(2, workspace = $$props.workspace);
    		if ("visible" in $$props) $$invalidate(3, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [requests, groups, workspace, visible];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			requests: 0,
    			groups: 1,
    			workspace: 2,
    			visible: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*requests*/ ctx[0] === undefined && !("requests" in props)) {
    			console.warn("<Sidebar> was created without expected prop 'requests'");
    		}

    		if (/*groups*/ ctx[1] === undefined && !("groups" in props)) {
    			console.warn("<Sidebar> was created without expected prop 'groups'");
    		}

    		if (/*workspace*/ ctx[2] === undefined && !("workspace" in props)) {
    			console.warn("<Sidebar> was created without expected prop 'workspace'");
    		}

    		if (/*visible*/ ctx[3] === undefined && !("visible" in props)) {
    			console.warn("<Sidebar> was created without expected prop 'visible'");
    		}
    	}

    	get requests() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set requests(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groups() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groups(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get workspace() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set workspace(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function deepFreeze(obj) {
        if (obj instanceof Map) {
            obj.clear = obj.delete = obj.set = function () {
                throw new Error('map is read-only');
            };
        } else if (obj instanceof Set) {
            obj.add = obj.clear = obj.delete = function () {
                throw new Error('set is read-only');
            };
        }

        // Freeze self
        Object.freeze(obj);

        Object.getOwnPropertyNames(obj).forEach(function (name) {
            var prop = obj[name];

            // Freeze prop if it is an object
            if (typeof prop == 'object' && !Object.isFrozen(prop)) {
                deepFreeze(prop);
            }
        });

        return obj;
    }

    var deepFreezeEs6 = deepFreeze;
    var _default = deepFreeze;
    deepFreezeEs6.default = _default;

    /** @implements CallbackResponse */
    class Response {
      /**
       * @param {CompiledMode} mode
       */
      constructor(mode) {
        // eslint-disable-next-line no-undefined
        if (mode.data === undefined) mode.data = {};

        this.data = mode.data;
        this.isMatchIgnored = false;
      }

      ignoreMatch() {
        this.isMatchIgnored = true;
      }
    }

    /**
     * @param {string} value
     * @returns {string}
     */
    function escapeHTML(value) {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }

    /**
     * performs a shallow merge of multiple objects into one
     *
     * @template T
     * @param {T} original
     * @param {Record<string,any>[]} objects
     * @returns {T} a single new object
     */
    function inherit(original, ...objects) {
      /** @type Record<string,any> */
      const result = Object.create(null);

      for (const key in original) {
        result[key] = original[key];
      }
      objects.forEach(function(obj) {
        for (const key in obj) {
          result[key] = obj[key];
        }
      });
      return /** @type {T} */ (result);
    }

    /**
     * @typedef {object} Renderer
     * @property {(text: string) => void} addText
     * @property {(node: Node) => void} openNode
     * @property {(node: Node) => void} closeNode
     * @property {() => string} value
     */

    /** @typedef {{kind?: string, sublanguage?: boolean}} Node */
    /** @typedef {{walk: (r: Renderer) => void}} Tree */
    /** */

    const SPAN_CLOSE = '</span>';

    /**
     * Determines if a node needs to be wrapped in <span>
     *
     * @param {Node} node */
    const emitsWrappingTags = (node) => {
      return !!node.kind;
    };

    /** @type {Renderer} */
    class HTMLRenderer {
      /**
       * Creates a new HTMLRenderer
       *
       * @param {Tree} parseTree - the parse tree (must support `walk` API)
       * @param {{classPrefix: string}} options
       */
      constructor(parseTree, options) {
        this.buffer = "";
        this.classPrefix = options.classPrefix;
        parseTree.walk(this);
      }

      /**
       * Adds texts to the output stream
       *
       * @param {string} text */
      addText(text) {
        this.buffer += escapeHTML(text);
      }

      /**
       * Adds a node open to the output stream (if needed)
       *
       * @param {Node} node */
      openNode(node) {
        if (!emitsWrappingTags(node)) return;

        let className = node.kind;
        if (!node.sublanguage) {
          className = `${this.classPrefix}${className}`;
        }
        this.span(className);
      }

      /**
       * Adds a node close to the output stream (if needed)
       *
       * @param {Node} node */
      closeNode(node) {
        if (!emitsWrappingTags(node)) return;

        this.buffer += SPAN_CLOSE;
      }

      /**
       * returns the accumulated buffer
      */
      value() {
        return this.buffer;
      }

      // helpers

      /**
       * Builds a span element
       *
       * @param {string} className */
      span(className) {
        this.buffer += `<span class="${className}">`;
      }
    }

    /** @typedef {{kind?: string, sublanguage?: boolean, children: Node[]} | string} Node */
    /** @typedef {{kind?: string, sublanguage?: boolean, children: Node[]} } DataNode */
    /**  */

    class TokenTree {
      constructor() {
        /** @type DataNode */
        this.rootNode = { children: [] };
        this.stack = [this.rootNode];
      }

      get top() {
        return this.stack[this.stack.length - 1];
      }

      get root() { return this.rootNode; }

      /** @param {Node} node */
      add(node) {
        this.top.children.push(node);
      }

      /** @param {string} kind */
      openNode(kind) {
        /** @type Node */
        const node = { kind, children: [] };
        this.add(node);
        this.stack.push(node);
      }

      closeNode() {
        if (this.stack.length > 1) {
          return this.stack.pop();
        }
        // eslint-disable-next-line no-undefined
        return undefined;
      }

      closeAllNodes() {
        while (this.closeNode());
      }

      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }

      /**
       * @typedef { import("./html_renderer").Renderer } Renderer
       * @param {Renderer} builder
       */
      walk(builder) {
        // this does not
        return this.constructor._walk(builder, this.rootNode);
        // this works
        // return TokenTree._walk(builder, this.rootNode);
      }

      /**
       * @param {Renderer} builder
       * @param {Node} node
       */
      static _walk(builder, node) {
        if (typeof node === "string") {
          builder.addText(node);
        } else if (node.children) {
          builder.openNode(node);
          node.children.forEach((child) => this._walk(builder, child));
          builder.closeNode(node);
        }
        return builder;
      }

      /**
       * @param {Node} node
       */
      static _collapse(node) {
        if (typeof node === "string") return;
        if (!node.children) return;

        if (node.children.every(el => typeof el === "string")) {
          // node.text = node.children.join("");
          // delete node.children;
          node.children = [node.children.join("")];
        } else {
          node.children.forEach((child) => {
            TokenTree._collapse(child);
          });
        }
      }
    }

    /**
      Currently this is all private API, but this is the minimal API necessary
      that an Emitter must implement to fully support the parser.

      Minimal interface:

      - addKeyword(text, kind)
      - addText(text)
      - addSublanguage(emitter, subLanguageName)
      - finalize()
      - openNode(kind)
      - closeNode()
      - closeAllNodes()
      - toHTML()

    */

    /**
     * @implements {Emitter}
     */
    class TokenTreeEmitter extends TokenTree {
      /**
       * @param {*} options
       */
      constructor(options) {
        super();
        this.options = options;
      }

      /**
       * @param {string} text
       * @param {string} kind
       */
      addKeyword(text, kind) {
        if (text === "") { return; }

        this.openNode(kind);
        this.addText(text);
        this.closeNode();
      }

      /**
       * @param {string} text
       */
      addText(text) {
        if (text === "") { return; }

        this.add(text);
      }

      /**
       * @param {Emitter & {root: DataNode}} emitter
       * @param {string} name
       */
      addSublanguage(emitter, name) {
        /** @type DataNode */
        const node = emitter.root;
        node.kind = name;
        node.sublanguage = true;
        this.add(node);
      }

      toHTML() {
        const renderer = new HTMLRenderer(this, this.options);
        return renderer.value();
      }

      finalize() {
        return true;
      }
    }

    /**
     * @param {string} value
     * @returns {RegExp}
     * */
    function escape$1(value) {
      return new RegExp(value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'm');
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function source(re) {
      if (!re) return null;
      if (typeof re === "string") return re;

      return re.source;
    }

    /**
     * @param {...(RegExp | string) } args
     * @returns {string}
     */
    function concat(...args) {
      const joined = args.map((x) => source(x)).join("");
      return joined;
    }

    /**
     * Any of the passed expresssions may match
     *
     * Creates a huge this | this | that | that match
     * @param {(RegExp | string)[] } args
     * @returns {string}
     */
    function either(...args) {
      const joined = '(' + args.map((x) => source(x)).join("|") + ")";
      return joined;
    }

    /**
     * @param {RegExp} re
     * @returns {number}
     */
    function countMatchGroups(re) {
      return (new RegExp(re.toString() + '|')).exec('').length - 1;
    }

    /**
     * Does lexeme start with a regular expression match at the beginning
     * @param {RegExp} re
     * @param {string} lexeme
     */
    function startsWith(re, lexeme) {
      const match = re && re.exec(lexeme);
      return match && match.index === 0;
    }

    // BACKREF_RE matches an open parenthesis or backreference. To avoid
    // an incorrect parse, it additionally matches the following:
    // - [...] elements, where the meaning of parentheses and escapes change
    // - other escape sequences, so we do not misparse escape sequences as
    //   interesting elements
    // - non-matching or lookahead parentheses, which do not capture. These
    //   follow the '(' with a '?'.
    const BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;

    // join logically computes regexps.join(separator), but fixes the
    // backreferences so they continue to match.
    // it also places each individual regular expression into it's own
    // match group, keeping track of the sequencing of those match groups
    // is currently an exercise for the caller. :-)
    /**
     * @param {(string | RegExp)[]} regexps
     * @param {string} separator
     * @returns {string}
     */
    function join(regexps, separator = "|") {
      let numCaptures = 0;

      return regexps.map((regex) => {
        numCaptures += 1;
        const offset = numCaptures;
        let re = source(regex);
        let out = '';

        while (re.length > 0) {
          const match = BACKREF_RE.exec(re);
          if (!match) {
            out += re;
            break;
          }
          out += re.substring(0, match.index);
          re = re.substring(match.index + match[0].length);
          if (match[0][0] === '\\' && match[1]) {
            // Adjust the backreference.
            out += '\\' + String(Number(match[1]) + offset);
          } else {
            out += match[0];
            if (match[0] === '(') {
              numCaptures++;
            }
          }
        }
        return out;
      }).map(re => `(${re})`).join(separator);
    }

    // Common regexps
    const MATCH_NOTHING_RE = /\b\B/;
    const IDENT_RE = '[a-zA-Z]\\w*';
    const UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
    const NUMBER_RE = '\\b\\d+(\\.\\d+)?';
    const C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
    const BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
    const RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

    /**
    * @param { Partial<Mode> & {binary?: string | RegExp} } opts
    */
    const SHEBANG = (opts = {}) => {
      const beginShebang = /^#![ ]*\//;
      if (opts.binary) {
        opts.begin = concat(
          beginShebang,
          /.*\b/,
          opts.binary,
          /\b.*/);
      }
      return inherit({
        className: 'meta',
        begin: beginShebang,
        end: /$/,
        relevance: 0,
        /** @type {ModeCallback} */
        "on:begin": (m, resp) => {
          if (m.index !== 0) resp.ignoreMatch();
        }
      }, opts);
    };

    // Common modes
    const BACKSLASH_ESCAPE = {
      begin: '\\\\[\\s\\S]', relevance: 0
    };
    const APOS_STRING_MODE = {
      className: 'string',
      begin: '\'',
      end: '\'',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
    };
    const QUOTE_STRING_MODE = {
      className: 'string',
      begin: '"',
      end: '"',
      illegal: '\\n',
      contains: [BACKSLASH_ESCAPE]
    };
    const PHRASAL_WORDS_MODE = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    };
    /**
     * Creates a comment mode
     *
     * @param {string | RegExp} begin
     * @param {string | RegExp} end
     * @param {Mode | {}} [modeOptions]
     * @returns {Partial<Mode>}
     */
    const COMMENT = function(begin, end, modeOptions = {}) {
      const mode = inherit(
        {
          className: 'comment',
          begin,
          end,
          contains: []
        },
        modeOptions
      );
      mode.contains.push(PHRASAL_WORDS_MODE);
      mode.contains.push({
        className: 'doctag',
        begin: '(?:TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):',
        relevance: 0
      });
      return mode;
    };
    const C_LINE_COMMENT_MODE = COMMENT('//', '$');
    const C_BLOCK_COMMENT_MODE = COMMENT('/\\*', '\\*/');
    const HASH_COMMENT_MODE = COMMENT('#', '$');
    const NUMBER_MODE = {
      className: 'number',
      begin: NUMBER_RE,
      relevance: 0
    };
    const C_NUMBER_MODE = {
      className: 'number',
      begin: C_NUMBER_RE,
      relevance: 0
    };
    const BINARY_NUMBER_MODE = {
      className: 'number',
      begin: BINARY_NUMBER_RE,
      relevance: 0
    };
    const CSS_NUMBER_MODE = {
      className: 'number',
      begin: NUMBER_RE + '(' +
        '%|em|ex|ch|rem' +
        '|vw|vh|vmin|vmax' +
        '|cm|mm|in|pt|pc|px' +
        '|deg|grad|rad|turn' +
        '|s|ms' +
        '|Hz|kHz' +
        '|dpi|dpcm|dppx' +
        ')?',
      relevance: 0
    };
    const REGEXP_MODE = {
      // this outer rule makes sure we actually have a WHOLE regex and not simply
      // an expression such as:
      //
      //     3 / something
      //
      // (which will then blow up when regex's `illegal` sees the newline)
      begin: /(?=\/[^/\n]*\/)/,
      contains: [{
        className: 'regexp',
        begin: /\//,
        end: /\/[gimuy]*/,
        illegal: /\n/,
        contains: [
          BACKSLASH_ESCAPE,
          {
            begin: /\[/,
            end: /\]/,
            relevance: 0,
            contains: [BACKSLASH_ESCAPE]
          }
        ]
      }]
    };
    const TITLE_MODE = {
      className: 'title',
      begin: IDENT_RE,
      relevance: 0
    };
    const UNDERSCORE_TITLE_MODE = {
      className: 'title',
      begin: UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    const METHOD_GUARD = {
      // excludes method names from keyword processing
      begin: '\\.\\s*' + UNDERSCORE_IDENT_RE,
      relevance: 0
    };

    /**
     * Adds end same as begin mechanics to a mode
     *
     * Your mode must include at least a single () match group as that first match
     * group is what is used for comparison
     * @param {Partial<Mode>} mode
     */
    const END_SAME_AS_BEGIN = function(mode) {
      return Object.assign(mode,
        {
          /** @type {ModeCallback} */
          'on:begin': (m, resp) => { resp.data._beginMatch = m[1]; },
          /** @type {ModeCallback} */
          'on:end': (m, resp) => { if (resp.data._beginMatch !== m[1]) resp.ignoreMatch(); }
        });
    };

    var MODES = /*#__PURE__*/Object.freeze({
        __proto__: null,
        MATCH_NOTHING_RE: MATCH_NOTHING_RE,
        IDENT_RE: IDENT_RE,
        UNDERSCORE_IDENT_RE: UNDERSCORE_IDENT_RE,
        NUMBER_RE: NUMBER_RE,
        C_NUMBER_RE: C_NUMBER_RE,
        BINARY_NUMBER_RE: BINARY_NUMBER_RE,
        RE_STARTERS_RE: RE_STARTERS_RE,
        SHEBANG: SHEBANG,
        BACKSLASH_ESCAPE: BACKSLASH_ESCAPE,
        APOS_STRING_MODE: APOS_STRING_MODE,
        QUOTE_STRING_MODE: QUOTE_STRING_MODE,
        PHRASAL_WORDS_MODE: PHRASAL_WORDS_MODE,
        COMMENT: COMMENT,
        C_LINE_COMMENT_MODE: C_LINE_COMMENT_MODE,
        C_BLOCK_COMMENT_MODE: C_BLOCK_COMMENT_MODE,
        HASH_COMMENT_MODE: HASH_COMMENT_MODE,
        NUMBER_MODE: NUMBER_MODE,
        C_NUMBER_MODE: C_NUMBER_MODE,
        BINARY_NUMBER_MODE: BINARY_NUMBER_MODE,
        CSS_NUMBER_MODE: CSS_NUMBER_MODE,
        REGEXP_MODE: REGEXP_MODE,
        TITLE_MODE: TITLE_MODE,
        UNDERSCORE_TITLE_MODE: UNDERSCORE_TITLE_MODE,
        METHOD_GUARD: METHOD_GUARD,
        END_SAME_AS_BEGIN: END_SAME_AS_BEGIN
    });

    // Grammar extensions / plugins
    // See: https://github.com/highlightjs/highlight.js/issues/2833

    // Grammar extensions allow "syntactic sugar" to be added to the grammar modes
    // without requiring any underlying changes to the compiler internals.

    // `compileMatch` being the perfect small example of now allowing a grammar
    // author to write `match` when they desire to match a single expression rather
    // than being forced to use `begin`.  The extension then just moves `match` into
    // `begin` when it runs.  Ie, no features have been added, but we've just made
    // the experience of writing (and reading grammars) a little bit nicer.

    // ------

    // TODO: We need negative look-behind support to do this properly
    /**
     * Skip a match if it has a preceding dot
     *
     * This is used for `beginKeywords` to prevent matching expressions such as
     * `bob.keyword.do()`. The mode compiler automatically wires this up as a
     * special _internal_ 'on:begin' callback for modes with `beginKeywords`
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    function skipIfhasPrecedingDot(match, response) {
      const before = match.input[match.index - 1];
      if (before === ".") {
        response.ignoreMatch();
      }
    }


    /**
     * `beginKeywords` syntactic sugar
     * @type {CompilerExt}
     */
    function beginKeywords(mode, parent) {
      if (!parent) return;
      if (!mode.beginKeywords) return;

      // for languages with keywords that include non-word characters checking for
      // a word boundary is not sufficient, so instead we check for a word boundary
      // or whitespace - this does no harm in any case since our keyword engine
      // doesn't allow spaces in keywords anyways and we still check for the boundary
      // first
      mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')(?!\\.)(?=\\b|\\s)';
      mode.__beforeBegin = skipIfhasPrecedingDot;
      mode.keywords = mode.keywords || mode.beginKeywords;
      delete mode.beginKeywords;

      // prevents double relevance, the keywords themselves provide
      // relevance, the mode doesn't need to double it
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined) mode.relevance = 0;
    }

    /**
     * Allow `illegal` to contain an array of illegal values
     * @type {CompilerExt}
     */
    function compileIllegal(mode, _parent) {
      if (!Array.isArray(mode.illegal)) return;

      mode.illegal = either(...mode.illegal);
    }

    /**
     * `match` to match a single expression for readability
     * @type {CompilerExt}
     */
    function compileMatch(mode, _parent) {
      if (!mode.match) return;
      if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");

      mode.begin = mode.match;
      delete mode.match;
    }

    /**
     * provides the default 1 relevance to all modes
     * @type {CompilerExt}
     */
    function compileRelevance(mode, _parent) {
      // eslint-disable-next-line no-undefined
      if (mode.relevance === undefined) mode.relevance = 1;
    }

    // keywords that should have no default relevance value
    const COMMON_KEYWORDS = [
      'of',
      'and',
      'for',
      'in',
      'not',
      'or',
      'if',
      'then',
      'parent', // common variable name
      'list', // common variable name
      'value' // common variable name
    ];

    const DEFAULT_KEYWORD_CLASSNAME = "keyword";

    /**
     * Given raw keywords from a language definition, compile them.
     *
     * @param {string | Record<string,string|string[]> | Array<string>} rawKeywords
     * @param {boolean} caseInsensitive
     */
    function compileKeywords(rawKeywords, caseInsensitive, className = DEFAULT_KEYWORD_CLASSNAME) {
      /** @type KeywordDict */
      const compiledKeywords = {};

      // input can be a string of keywords, an array of keywords, or a object with
      // named keys representing className (which can then point to a string or array)
      if (typeof rawKeywords === 'string') {
        compileList(className, rawKeywords.split(" "));
      } else if (Array.isArray(rawKeywords)) {
        compileList(className, rawKeywords);
      } else {
        Object.keys(rawKeywords).forEach(function(className) {
          // collapse all our objects back into the parent object
          Object.assign(
            compiledKeywords,
            compileKeywords(rawKeywords[className], caseInsensitive, className)
          );
        });
      }
      return compiledKeywords;

      // ---

      /**
       * Compiles an individual list of keywords
       *
       * Ex: "for if when while|5"
       *
       * @param {string} className
       * @param {Array<string>} keywordList
       */
      function compileList(className, keywordList) {
        if (caseInsensitive) {
          keywordList = keywordList.map(x => x.toLowerCase());
        }
        keywordList.forEach(function(keyword) {
          const pair = keyword.split('|');
          compiledKeywords[pair[0]] = [className, scoreForKeyword(pair[0], pair[1])];
        });
      }
    }

    /**
     * Returns the proper score for a given keyword
     *
     * Also takes into account comment keywords, which will be scored 0 UNLESS
     * another score has been manually assigned.
     * @param {string} keyword
     * @param {string} [providedScore]
     */
    function scoreForKeyword(keyword, providedScore) {
      // manual scores always win over common keywords
      // so you can force a score of 1 if you really insist
      if (providedScore) {
        return Number(providedScore);
      }

      return commonKeyword(keyword) ? 0 : 1;
    }

    /**
     * Determines if a given keyword is common or not
     *
     * @param {string} keyword */
    function commonKeyword(keyword) {
      return COMMON_KEYWORDS.includes(keyword.toLowerCase());
    }

    // compilation

    /**
     * Compiles a language definition result
     *
     * Given the raw result of a language definition (Language), compiles this so
     * that it is ready for highlighting code.
     * @param {Language} language
     * @param {{plugins: HLJSPlugin[]}} opts
     * @returns {CompiledLanguage}
     */
    function compileLanguage(language, { plugins }) {
      /**
       * Builds a regex with the case sensativility of the current language
       *
       * @param {RegExp | string} value
       * @param {boolean} [global]
       */
      function langRe(value, global) {
        return new RegExp(
          source(value),
          'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
        );
      }

      /**
        Stores multiple regular expressions and allows you to quickly search for
        them all in a string simultaneously - returning the first match.  It does
        this by creating a huge (a|b|c) regex - each individual item wrapped with ()
        and joined by `|` - using match groups to track position.  When a match is
        found checking which position in the array has content allows us to figure
        out which of the original regexes / match groups triggered the match.

        The match object itself (the result of `Regex.exec`) is returned but also
        enhanced by merging in any meta-data that was registered with the regex.
        This is how we keep track of which mode matched, and what type of rule
        (`illegal`, `begin`, end, etc).
      */
      class MultiRegex {
        constructor() {
          this.matchIndexes = {};
          // @ts-ignore
          this.regexes = [];
          this.matchAt = 1;
          this.position = 0;
        }

        // @ts-ignore
        addRule(re, opts) {
          opts.position = this.position++;
          // @ts-ignore
          this.matchIndexes[this.matchAt] = opts;
          this.regexes.push([opts, re]);
          this.matchAt += countMatchGroups(re) + 1;
        }

        compile() {
          if (this.regexes.length === 0) {
            // avoids the need to check length every time exec is called
            // @ts-ignore
            this.exec = () => null;
          }
          const terminators = this.regexes.map(el => el[1]);
          this.matcherRe = langRe(join(terminators), true);
          this.lastIndex = 0;
        }

        /** @param {string} s */
        exec(s) {
          this.matcherRe.lastIndex = this.lastIndex;
          const match = this.matcherRe.exec(s);
          if (!match) { return null; }

          // eslint-disable-next-line no-undefined
          const i = match.findIndex((el, i) => i > 0 && el !== undefined);
          // @ts-ignore
          const matchData = this.matchIndexes[i];
          // trim off any earlier non-relevant match groups (ie, the other regex
          // match groups that make up the multi-matcher)
          match.splice(0, i);

          return Object.assign(match, matchData);
        }
      }

      /*
        Created to solve the key deficiently with MultiRegex - there is no way to
        test for multiple matches at a single location.  Why would we need to do
        that?  In the future a more dynamic engine will allow certain matches to be
        ignored.  An example: if we matched say the 3rd regex in a large group but
        decided to ignore it - we'd need to started testing again at the 4th
        regex... but MultiRegex itself gives us no real way to do that.

        So what this class creates MultiRegexs on the fly for whatever search
        position they are needed.

        NOTE: These additional MultiRegex objects are created dynamically.  For most
        grammars most of the time we will never actually need anything more than the
        first MultiRegex - so this shouldn't have too much overhead.

        Say this is our search group, and we match regex3, but wish to ignore it.

          regex1 | regex2 | regex3 | regex4 | regex5    ' ie, startAt = 0

        What we need is a new MultiRegex that only includes the remaining
        possibilities:

          regex4 | regex5                               ' ie, startAt = 3

        This class wraps all that complexity up in a simple API... `startAt` decides
        where in the array of expressions to start doing the matching. It
        auto-increments, so if a match is found at position 2, then startAt will be
        set to 3.  If the end is reached startAt will return to 0.

        MOST of the time the parser will be setting startAt manually to 0.
      */
      class ResumableMultiRegex {
        constructor() {
          // @ts-ignore
          this.rules = [];
          // @ts-ignore
          this.multiRegexes = [];
          this.count = 0;

          this.lastIndex = 0;
          this.regexIndex = 0;
        }

        // @ts-ignore
        getMatcher(index) {
          if (this.multiRegexes[index]) return this.multiRegexes[index];

          const matcher = new MultiRegex();
          this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
          matcher.compile();
          this.multiRegexes[index] = matcher;
          return matcher;
        }

        resumingScanAtSamePosition() {
          return this.regexIndex !== 0;
        }

        considerAll() {
          this.regexIndex = 0;
        }

        // @ts-ignore
        addRule(re, opts) {
          this.rules.push([re, opts]);
          if (opts.type === "begin") this.count++;
        }

        /** @param {string} s */
        exec(s) {
          const m = this.getMatcher(this.regexIndex);
          m.lastIndex = this.lastIndex;
          let result = m.exec(s);

          // The following is because we have no easy way to say "resume scanning at the
          // existing position but also skip the current rule ONLY". What happens is
          // all prior rules are also skipped which can result in matching the wrong
          // thing. Example of matching "booger":

          // our matcher is [string, "booger", number]
          //
          // ....booger....

          // if "booger" is ignored then we'd really need a regex to scan from the
          // SAME position for only: [string, number] but ignoring "booger" (if it
          // was the first match), a simple resume would scan ahead who knows how
          // far looking only for "number", ignoring potential string matches (or
          // future "booger" matches that might be valid.)

          // So what we do: We execute two matchers, one resuming at the same
          // position, but the second full matcher starting at the position after:

          //     /--- resume first regex match here (for [number])
          //     |/---- full match here for [string, "booger", number]
          //     vv
          // ....booger....

          // Which ever results in a match first is then used. So this 3-4 step
          // process essentially allows us to say "match at this position, excluding
          // a prior rule that was ignored".
          //
          // 1. Match "booger" first, ignore. Also proves that [string] does non match.
          // 2. Resume matching for [number]
          // 3. Match at index + 1 for [string, "booger", number]
          // 4. If #2 and #3 result in matches, which came first?
          if (this.resumingScanAtSamePosition()) {
            if (result && result.index === this.lastIndex) ; else { // use the second matcher result
              const m2 = this.getMatcher(0);
              m2.lastIndex = this.lastIndex + 1;
              result = m2.exec(s);
            }
          }

          if (result) {
            this.regexIndex += result.position + 1;
            if (this.regexIndex === this.count) {
              // wrap-around to considering all matches again
              this.considerAll();
            }
          }

          return result;
        }
      }

      /**
       * Given a mode, builds a huge ResumableMultiRegex that can be used to walk
       * the content and find matches.
       *
       * @param {CompiledMode} mode
       * @returns {ResumableMultiRegex}
       */
      function buildModeRegex(mode) {
        const mm = new ResumableMultiRegex();

        mode.contains.forEach(term => mm.addRule(term.begin, { rule: term, type: "begin" }));

        if (mode.terminatorEnd) {
          mm.addRule(mode.terminatorEnd, { type: "end" });
        }
        if (mode.illegal) {
          mm.addRule(mode.illegal, { type: "illegal" });
        }

        return mm;
      }

      /** skip vs abort vs ignore
       *
       * @skip   - The mode is still entered and exited normally (and contains rules apply),
       *           but all content is held and added to the parent buffer rather than being
       *           output when the mode ends.  Mostly used with `sublanguage` to build up
       *           a single large buffer than can be parsed by sublanguage.
       *
       *             - The mode begin ands ends normally.
       *             - Content matched is added to the parent mode buffer.
       *             - The parser cursor is moved forward normally.
       *
       * @abort  - A hack placeholder until we have ignore.  Aborts the mode (as if it
       *           never matched) but DOES NOT continue to match subsequent `contains`
       *           modes.  Abort is bad/suboptimal because it can result in modes
       *           farther down not getting applied because an earlier rule eats the
       *           content but then aborts.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is added to the mode buffer.
       *             - The parser cursor is moved forward accordingly.
       *
       * @ignore - Ignores the mode (as if it never matched) and continues to match any
       *           subsequent `contains` modes.  Ignore isn't technically possible with
       *           the current parser implementation.
       *
       *             - The mode does not begin.
       *             - Content matched by `begin` is ignored.
       *             - The parser cursor is not moved forward.
       */

      /**
       * Compiles an individual mode
       *
       * This can raise an error if the mode contains certain detectable known logic
       * issues.
       * @param {Mode} mode
       * @param {CompiledMode | null} [parent]
       * @returns {CompiledMode | never}
       */
      function compileMode(mode, parent) {
        const cmode = /** @type CompiledMode */ (mode);
        if (mode.isCompiled) return cmode;

        [
          // do this early so compiler extensions generally don't have to worry about
          // the distinction between match/begin
          compileMatch
        ].forEach(ext => ext(mode, parent));

        language.compilerExtensions.forEach(ext => ext(mode, parent));

        // __beforeBegin is considered private API, internal use only
        mode.__beforeBegin = null;

        [
          beginKeywords,
          // do this later so compiler extensions that come earlier have access to the
          // raw array if they wanted to perhaps manipulate it, etc.
          compileIllegal,
          // default to 1 relevance if not specified
          compileRelevance
        ].forEach(ext => ext(mode, parent));

        mode.isCompiled = true;

        let keywordPattern = null;
        if (typeof mode.keywords === "object") {
          keywordPattern = mode.keywords.$pattern;
          delete mode.keywords.$pattern;
        }

        if (mode.keywords) {
          mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
        }

        // both are not allowed
        if (mode.lexemes && keywordPattern) {
          throw new Error("ERR: Prefer `keywords.$pattern` to `mode.lexemes`, BOTH are not allowed. (see mode reference) ");
        }

        // `mode.lexemes` was the old standard before we added and now recommend
        // using `keywords.$pattern` to pass the keyword pattern
        keywordPattern = keywordPattern || mode.lexemes || /\w+/;
        cmode.keywordPatternRe = langRe(keywordPattern, true);

        if (parent) {
          if (!mode.begin) mode.begin = /\B|\b/;
          cmode.beginRe = langRe(mode.begin);
          if (mode.endSameAsBegin) mode.end = mode.begin;
          if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
          if (mode.end) cmode.endRe = langRe(mode.end);
          cmode.terminatorEnd = source(mode.end) || '';
          if (mode.endsWithParent && parent.terminatorEnd) {
            cmode.terminatorEnd += (mode.end ? '|' : '') + parent.terminatorEnd;
          }
        }
        if (mode.illegal) cmode.illegalRe = langRe(/** @type {RegExp | string} */ (mode.illegal));
        if (!mode.contains) mode.contains = [];

        mode.contains = [].concat(...mode.contains.map(function(c) {
          return expandOrCloneMode(c === 'self' ? mode : c);
        }));
        mode.contains.forEach(function(c) { compileMode(/** @type Mode */ (c), cmode); });

        if (mode.starts) {
          compileMode(mode.starts, parent);
        }

        cmode.matcher = buildModeRegex(cmode);
        return cmode;
      }

      if (!language.compilerExtensions) language.compilerExtensions = [];

      // self is not valid at the top-level
      if (language.contains && language.contains.includes('self')) {
        throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      }

      // we need a null object, which inherit will guarantee
      language.classNameAliases = inherit(language.classNameAliases || {});

      return compileMode(/** @type Mode */ (language));
    }

    /**
     * Determines if a mode has a dependency on it's parent or not
     *
     * If a mode does have a parent dependency then often we need to clone it if
     * it's used in multiple places so that each copy points to the correct parent,
     * where-as modes without a parent can often safely be re-used at the bottom of
     * a mode chain.
     *
     * @param {Mode | null} mode
     * @returns {boolean} - is there a dependency on the parent?
     * */
    function dependencyOnParent(mode) {
      if (!mode) return false;

      return mode.endsWithParent || dependencyOnParent(mode.starts);
    }

    /**
     * Expands a mode or clones it if necessary
     *
     * This is necessary for modes with parental dependenceis (see notes on
     * `dependencyOnParent`) and for nodes that have `variants` - which must then be
     * exploded into their own individual modes at compile time.
     *
     * @param {Mode} mode
     * @returns {Mode | Mode[]}
     * */
    function expandOrCloneMode(mode) {
      if (mode.variants && !mode.cachedVariants) {
        mode.cachedVariants = mode.variants.map(function(variant) {
          return inherit(mode, { variants: null }, variant);
        });
      }

      // EXPAND
      // if we have variants then essentially "replace" the mode with the variants
      // this happens in compileMode, where this function is called from
      if (mode.cachedVariants) {
        return mode.cachedVariants;
      }

      // CLONE
      // if we have dependencies on parents then we need a unique
      // instance of ourselves, so we can be reused with many
      // different parents without issue
      if (dependencyOnParent(mode)) {
        return inherit(mode, { starts: mode.starts ? inherit(mode.starts) : null });
      }

      if (Object.isFrozen(mode)) {
        return inherit(mode);
      }

      // no special dependency issues, just return ourselves
      return mode;
    }

    var version = "10.7.2";

    // @ts-nocheck

    function hasValueOrEmptyAttribute(value) {
      return Boolean(value || value === "");
    }

    function BuildVuePlugin(hljs) {
      const Component = {
        props: ["language", "code", "autodetect"],
        data: function() {
          return {
            detectedLanguage: "",
            unknownLanguage: false
          };
        },
        computed: {
          className() {
            if (this.unknownLanguage) return "";

            return "hljs " + this.detectedLanguage;
          },
          highlighted() {
            // no idea what language to use, return raw code
            if (!this.autoDetect && !hljs.getLanguage(this.language)) {
              console.warn(`The language "${this.language}" you specified could not be found.`);
              this.unknownLanguage = true;
              return escapeHTML(this.code);
            }

            let result = {};
            if (this.autoDetect) {
              result = hljs.highlightAuto(this.code);
              this.detectedLanguage = result.language;
            } else {
              result = hljs.highlight(this.language, this.code, this.ignoreIllegals);
              this.detectedLanguage = this.language;
            }
            return result.value;
          },
          autoDetect() {
            return !this.language || hasValueOrEmptyAttribute(this.autodetect);
          },
          ignoreIllegals() {
            return true;
          }
        },
        // this avoids needing to use a whole Vue compilation pipeline just
        // to build Highlight.js
        render(createElement) {
          return createElement("pre", {}, [
            createElement("code", {
              class: this.className,
              domProps: { innerHTML: this.highlighted }
            })
          ]);
        }
        // template: `<pre><code :class="className" v-html="highlighted"></code></pre>`
      };

      const VuePlugin = {
        install(Vue) {
          Vue.component('highlightjs', Component);
        }
      };

      return { Component, VuePlugin };
    }

    /* plugin itself */

    /** @type {HLJSPlugin} */
    const mergeHTMLPlugin = {
      "after:highlightElement": ({ el, result, text }) => {
        const originalStream = nodeStream(el);
        if (!originalStream.length) return;

        const resultNode = document.createElement('div');
        resultNode.innerHTML = result.value;
        result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
      }
    };

    /* Stream merging support functions */

    /**
     * @typedef Event
     * @property {'start'|'stop'} event
     * @property {number} offset
     * @property {Node} node
     */

    /**
     * @param {Node} node
     */
    function tag(node) {
      return node.nodeName.toLowerCase();
    }

    /**
     * @param {Node} node
     */
    function nodeStream(node) {
      /** @type Event[] */
      const result = [];
      (function _nodeStream(node, offset) {
        for (let child = node.firstChild; child; child = child.nextSibling) {
          if (child.nodeType === 3) {
            offset += child.nodeValue.length;
          } else if (child.nodeType === 1) {
            result.push({
              event: 'start',
              offset: offset,
              node: child
            });
            offset = _nodeStream(child, offset);
            // Prevent void elements from having an end tag that would actually
            // double them in the output. There are more void elements in HTML
            // but we list only those realistically expected in code display.
            if (!tag(child).match(/br|hr|img|input/)) {
              result.push({
                event: 'stop',
                offset: offset,
                node: child
              });
            }
          }
        }
        return offset;
      })(node, 0);
      return result;
    }

    /**
     * @param {any} original - the original stream
     * @param {any} highlighted - stream of the highlighted source
     * @param {string} value - the original source itself
     */
    function mergeStreams(original, highlighted, value) {
      let processed = 0;
      let result = '';
      const nodeStack = [];

      function selectStream() {
        if (!original.length || !highlighted.length) {
          return original.length ? original : highlighted;
        }
        if (original[0].offset !== highlighted[0].offset) {
          return (original[0].offset < highlighted[0].offset) ? original : highlighted;
        }

        /*
        To avoid starting the stream just before it should stop the order is
        ensured that original always starts first and closes last:

        if (event1 == 'start' && event2 == 'start')
          return original;
        if (event1 == 'start' && event2 == 'stop')
          return highlighted;
        if (event1 == 'stop' && event2 == 'start')
          return original;
        if (event1 == 'stop' && event2 == 'stop')
          return highlighted;

        ... which is collapsed to:
        */
        return highlighted[0].event === 'start' ? original : highlighted;
      }

      /**
       * @param {Node} node
       */
      function open(node) {
        /** @param {Attr} attr */
        function attributeString(attr) {
          return ' ' + attr.nodeName + '="' + escapeHTML(attr.value) + '"';
        }
        // @ts-ignore
        result += '<' + tag(node) + [].map.call(node.attributes, attributeString).join('') + '>';
      }

      /**
       * @param {Node} node
       */
      function close(node) {
        result += '</' + tag(node) + '>';
      }

      /**
       * @param {Event} event
       */
      function render(event) {
        (event.event === 'start' ? open : close)(event.node);
      }

      while (original.length || highlighted.length) {
        let stream = selectStream();
        result += escapeHTML(value.substring(processed, stream[0].offset));
        processed = stream[0].offset;
        if (stream === original) {
          /*
          On any opening or closing tag of the original markup we first close
          the entire highlighted node stack, then render the original tag along
          with all the following original tags at the same offset and then
          reopen all the tags on the highlighted stack.
          */
          nodeStack.reverse().forEach(close);
          do {
            render(stream.splice(0, 1)[0]);
            stream = selectStream();
          } while (stream === original && stream.length && stream[0].offset === processed);
          nodeStack.reverse().forEach(open);
        } else {
          if (stream[0].event === 'start') {
            nodeStack.push(stream[0].node);
          } else {
            nodeStack.pop();
          }
          render(stream.splice(0, 1)[0]);
        }
      }
      return result + escapeHTML(value.substr(processed));
    }

    /*

    For the reasoning behind this please see:
    https://github.com/highlightjs/highlight.js/issues/2880#issuecomment-747275419

    */

    /**
     * @type {Record<string, boolean>}
     */
    const seenDeprecations = {};

    /**
     * @param {string} message
     */
    const error = (message) => {
      console.error(message);
    };

    /**
     * @param {string} message
     * @param {any} args
     */
    const warn = (message, ...args) => {
      console.log(`WARN: ${message}`, ...args);
    };

    /**
     * @param {string} version
     * @param {string} message
     */
    const deprecated = (version, message) => {
      if (seenDeprecations[`${version}/${message}`]) return;

      console.log(`Deprecated as of ${version}. ${message}`);
      seenDeprecations[`${version}/${message}`] = true;
    };

    /*
    Syntax highlighting with language autodetection.
    https://highlightjs.org/
    */

    const escape$1$1 = escapeHTML;
    const inherit$1 = inherit;
    const NO_MATCH = Symbol("nomatch");

    /**
     * @param {any} hljs - object that is extended (legacy)
     * @returns {HLJSApi}
     */
    const HLJS = function(hljs) {
      // Global internal variables used within the highlight.js library.
      /** @type {Record<string, Language>} */
      const languages = Object.create(null);
      /** @type {Record<string, string>} */
      const aliases = Object.create(null);
      /** @type {HLJSPlugin[]} */
      const plugins = [];

      // safe/production mode - swallows more errors, tries to keep running
      // even if a single syntax or parse hits a fatal error
      let SAFE_MODE = true;
      const fixMarkupRe = /(^(<[^>]+>|\t|)+|\n)/gm;
      const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
      /** @type {Language} */
      const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: 'Plain text', contains: [] };

      // Global options used when within external APIs. This is modified when
      // calling the `hljs.configure` function.
      /** @type HLJSOptions */
      let options = {
        noHighlightRe: /^(no-?highlight)$/i,
        languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
        classPrefix: 'hljs-',
        tabReplace: null,
        useBR: false,
        languages: null,
        // beta configuration options, subject to change, welcome to discuss
        // https://github.com/highlightjs/highlight.js/issues/1086
        __emitter: TokenTreeEmitter
      };

      /* Utility functions */

      /**
       * Tests a language name to see if highlighting should be skipped
       * @param {string} languageName
       */
      function shouldNotHighlight(languageName) {
        return options.noHighlightRe.test(languageName);
      }

      /**
       * @param {HighlightedHTMLElement} block - the HTML element to determine language for
       */
      function blockLanguage(block) {
        let classes = block.className + ' ';

        classes += block.parentNode ? block.parentNode.className : '';

        // language-* takes precedence over non-prefixed class names.
        const match = options.languageDetectRe.exec(classes);
        if (match) {
          const language = getLanguage(match[1]);
          if (!language) {
            warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
            warn("Falling back to no-highlight mode for this block.", block);
          }
          return language ? match[1] : 'no-highlight';
        }

        return classes
          .split(/\s+/)
          .find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
      }

      /**
       * Core highlighting function.
       *
       * OLD API
       * highlight(lang, code, ignoreIllegals, continuation)
       *
       * NEW API
       * highlight(code, {lang, ignoreIllegals})
       *
       * @param {string} codeOrlanguageName - the language to use for highlighting
       * @param {string | HighlightOptions} optionsOrCode - the code to highlight
       * @param {boolean} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       * @param {CompiledMode} [continuation] - current continuation mode, if any
       *
       * @returns {HighlightResult} Result - an object that represents the result
       * @property {string} language - the language name
       * @property {number} relevance - the relevance score
       * @property {string} value - the highlighted HTML code
       * @property {string} code - the original raw code
       * @property {CompiledMode} top - top of the current mode stack
       * @property {boolean} illegal - indicates whether any illegal matches were found
      */
      function highlight(codeOrlanguageName, optionsOrCode, ignoreIllegals, continuation) {
        let code = "";
        let languageName = "";
        if (typeof optionsOrCode === "object") {
          code = codeOrlanguageName;
          ignoreIllegals = optionsOrCode.ignoreIllegals;
          languageName = optionsOrCode.language;
          // continuation not supported at all via the new API
          // eslint-disable-next-line no-undefined
          continuation = undefined;
        } else {
          // old API
          deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
          deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
          languageName = codeOrlanguageName;
          code = optionsOrCode;
        }

        /** @type {BeforeHighlightContext} */
        const context = {
          code,
          language: languageName
        };
        // the plugin can change the desired language or the code to be highlighted
        // just be changing the object it was passed
        fire("before:highlight", context);

        // a before plugin can usurp the result completely by providing it's own
        // in which case we don't even need to call highlight
        const result = context.result
          ? context.result
          : _highlight(context.language, context.code, ignoreIllegals, continuation);

        result.code = context.code;
        // the plugin can change anything in result to suite it
        fire("after:highlight", result);

        return result;
      }

      /**
       * private highlight that's used internally and does not fire callbacks
       *
       * @param {string} languageName - the language to use for highlighting
       * @param {string} codeToHighlight - the code to highlight
       * @param {boolean?} [ignoreIllegals] - whether to ignore illegal matches, default is to bail
       * @param {CompiledMode?} [continuation] - current continuation mode, if any
       * @returns {HighlightResult} - result of the highlight operation
      */
      function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
        /**
         * Return keyword data if a match is a keyword
         * @param {CompiledMode} mode - current mode
         * @param {RegExpMatchArray} match - regexp match data
         * @returns {KeywordData | false}
         */
        function keywordData(mode, match) {
          const matchText = language.case_insensitive ? match[0].toLowerCase() : match[0];
          return Object.prototype.hasOwnProperty.call(mode.keywords, matchText) && mode.keywords[matchText];
        }

        function processKeywords() {
          if (!top.keywords) {
            emitter.addText(modeBuffer);
            return;
          }

          let lastIndex = 0;
          top.keywordPatternRe.lastIndex = 0;
          let match = top.keywordPatternRe.exec(modeBuffer);
          let buf = "";

          while (match) {
            buf += modeBuffer.substring(lastIndex, match.index);
            const data = keywordData(top, match);
            if (data) {
              const [kind, keywordRelevance] = data;
              emitter.addText(buf);
              buf = "";

              relevance += keywordRelevance;
              if (kind.startsWith("_")) {
                // _ implied for relevance only, do not highlight
                // by applying a class name
                buf += match[0];
              } else {
                const cssClass = language.classNameAliases[kind] || kind;
                emitter.addKeyword(match[0], cssClass);
              }
            } else {
              buf += match[0];
            }
            lastIndex = top.keywordPatternRe.lastIndex;
            match = top.keywordPatternRe.exec(modeBuffer);
          }
          buf += modeBuffer.substr(lastIndex);
          emitter.addText(buf);
        }

        function processSubLanguage() {
          if (modeBuffer === "") return;
          /** @type HighlightResult */
          let result = null;

          if (typeof top.subLanguage === 'string') {
            if (!languages[top.subLanguage]) {
              emitter.addText(modeBuffer);
              return;
            }
            result = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
            continuations[top.subLanguage] = /** @type {CompiledMode} */ (result.top);
          } else {
            result = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
          }

          // Counting embedded language score towards the host language may be disabled
          // with zeroing the containing mode relevance. Use case in point is Markdown that
          // allows XML everywhere and makes every XML snippet to have a much larger Markdown
          // score.
          if (top.relevance > 0) {
            relevance += result.relevance;
          }
          emitter.addSublanguage(result.emitter, result.language);
        }

        function processBuffer() {
          if (top.subLanguage != null) {
            processSubLanguage();
          } else {
            processKeywords();
          }
          modeBuffer = '';
        }

        /**
         * @param {Mode} mode - new mode to start
         */
        function startNewMode(mode) {
          if (mode.className) {
            emitter.openNode(language.classNameAliases[mode.className] || mode.className);
          }
          top = Object.create(mode, { parent: { value: top } });
          return top;
        }

        /**
         * @param {CompiledMode } mode - the mode to potentially end
         * @param {RegExpMatchArray} match - the latest match
         * @param {string} matchPlusRemainder - match plus remainder of content
         * @returns {CompiledMode | void} - the next mode, or if void continue on in current mode
         */
        function endOfMode(mode, match, matchPlusRemainder) {
          let matched = startsWith(mode.endRe, matchPlusRemainder);

          if (matched) {
            if (mode["on:end"]) {
              const resp = new Response(mode);
              mode["on:end"](match, resp);
              if (resp.isMatchIgnored) matched = false;
            }

            if (matched) {
              while (mode.endsParent && mode.parent) {
                mode = mode.parent;
              }
              return mode;
            }
          }
          // even if on:end fires an `ignore` it's still possible
          // that we might trigger the end node because of a parent mode
          if (mode.endsWithParent) {
            return endOfMode(mode.parent, match, matchPlusRemainder);
          }
        }

        /**
         * Handle matching but then ignoring a sequence of text
         *
         * @param {string} lexeme - string containing full match text
         */
        function doIgnore(lexeme) {
          if (top.matcher.regexIndex === 0) {
            // no more regexs to potentially match here, so we move the cursor forward one
            // space
            modeBuffer += lexeme[0];
            return 1;
          } else {
            // no need to move the cursor, we still have additional regexes to try and
            // match at this very spot
            resumeScanAtSamePosition = true;
            return 0;
          }
        }

        /**
         * Handle the start of a new potential mode match
         *
         * @param {EnhancedMatch} match - the current match
         * @returns {number} how far to advance the parse cursor
         */
        function doBeginMatch(match) {
          const lexeme = match[0];
          const newMode = match.rule;

          const resp = new Response(newMode);
          // first internal before callbacks, then the public ones
          const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
          for (const cb of beforeCallbacks) {
            if (!cb) continue;
            cb(match, resp);
            if (resp.isMatchIgnored) return doIgnore(lexeme);
          }

          if (newMode && newMode.endSameAsBegin) {
            newMode.endRe = escape$1(lexeme);
          }

          if (newMode.skip) {
            modeBuffer += lexeme;
          } else {
            if (newMode.excludeBegin) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (!newMode.returnBegin && !newMode.excludeBegin) {
              modeBuffer = lexeme;
            }
          }
          startNewMode(newMode);
          // if (mode["after:begin"]) {
          //   let resp = new Response(mode);
          //   mode["after:begin"](match, resp);
          // }
          return newMode.returnBegin ? 0 : lexeme.length;
        }

        /**
         * Handle the potential end of mode
         *
         * @param {RegExpMatchArray} match - the current match
         */
        function doEndMatch(match) {
          const lexeme = match[0];
          const matchPlusRemainder = codeToHighlight.substr(match.index);

          const endMode = endOfMode(top, match, matchPlusRemainder);
          if (!endMode) { return NO_MATCH; }

          const origin = top;
          if (origin.skip) {
            modeBuffer += lexeme;
          } else {
            if (!(origin.returnEnd || origin.excludeEnd)) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (origin.excludeEnd) {
              modeBuffer = lexeme;
            }
          }
          do {
            if (top.className) {
              emitter.closeNode();
            }
            if (!top.skip && !top.subLanguage) {
              relevance += top.relevance;
            }
            top = top.parent;
          } while (top !== endMode.parent);
          if (endMode.starts) {
            if (endMode.endSameAsBegin) {
              endMode.starts.endRe = endMode.endRe;
            }
            startNewMode(endMode.starts);
          }
          return origin.returnEnd ? 0 : lexeme.length;
        }

        function processContinuations() {
          const list = [];
          for (let current = top; current !== language; current = current.parent) {
            if (current.className) {
              list.unshift(current.className);
            }
          }
          list.forEach(item => emitter.openNode(item));
        }

        /** @type {{type?: MatchType, index?: number, rule?: Mode}}} */
        let lastMatch = {};

        /**
         *  Process an individual match
         *
         * @param {string} textBeforeMatch - text preceeding the match (since the last match)
         * @param {EnhancedMatch} [match] - the match itself
         */
        function processLexeme(textBeforeMatch, match) {
          const lexeme = match && match[0];

          // add non-matched text to the current mode buffer
          modeBuffer += textBeforeMatch;

          if (lexeme == null) {
            processBuffer();
            return 0;
          }

          // we've found a 0 width match and we're stuck, so we need to advance
          // this happens when we have badly behaved rules that have optional matchers to the degree that
          // sometimes they can end up matching nothing at all
          // Ref: https://github.com/highlightjs/highlight.js/issues/2140
          if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
            // spit the "skipped" character that our regex choked on back into the output sequence
            modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
            if (!SAFE_MODE) {
              /** @type {AnnotatedError} */
              const err = new Error('0 width match regex');
              err.languageName = languageName;
              err.badRule = lastMatch.rule;
              throw err;
            }
            return 1;
          }
          lastMatch = match;

          if (match.type === "begin") {
            return doBeginMatch(match);
          } else if (match.type === "illegal" && !ignoreIllegals) {
            // illegal match, we do not continue processing
            /** @type {AnnotatedError} */
            const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');
            err.mode = top;
            throw err;
          } else if (match.type === "end") {
            const processed = doEndMatch(match);
            if (processed !== NO_MATCH) {
              return processed;
            }
          }

          // edge case for when illegal matches $ (end of line) which is technically
          // a 0 width match but not a begin/end match so it's not caught by the
          // first handler (when ignoreIllegals is true)
          if (match.type === "illegal" && lexeme === "") {
            // advance so we aren't stuck in an infinite loop
            return 1;
          }

          // infinite loops are BAD, this is a last ditch catch all. if we have a
          // decent number of iterations yet our index (cursor position in our
          // parsing) still 3x behind our index then something is very wrong
          // so we bail
          if (iterations > 100000 && iterations > match.index * 3) {
            const err = new Error('potential infinite loop, way more iterations than matches');
            throw err;
          }

          /*
          Why might be find ourselves here?  Only one occasion now.  An end match that was
          triggered but could not be completed.  When might this happen?  When an `endSameasBegin`
          rule sets the end rule to a specific match.  Since the overall mode termination rule that's
          being used to scan the text isn't recompiled that means that any match that LOOKS like
          the end (but is not, because it is not an exact match to the beginning) will
          end up here.  A definite end match, but when `doEndMatch` tries to "reapply"
          the end rule and fails to match, we wind up here, and just silently ignore the end.

          This causes no real harm other than stopping a few times too many.
          */

          modeBuffer += lexeme;
          return lexeme.length;
        }

        const language = getLanguage(languageName);
        if (!language) {
          error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
          throw new Error('Unknown language: "' + languageName + '"');
        }

        const md = compileLanguage(language, { plugins });
        let result = '';
        /** @type {CompiledMode} */
        let top = continuation || md;
        /** @type Record<string,CompiledMode> */
        const continuations = {}; // keep continuations for sub-languages
        const emitter = new options.__emitter(options);
        processContinuations();
        let modeBuffer = '';
        let relevance = 0;
        let index = 0;
        let iterations = 0;
        let resumeScanAtSamePosition = false;

        try {
          top.matcher.considerAll();

          for (;;) {
            iterations++;
            if (resumeScanAtSamePosition) {
              // only regexes not matched previously will now be
              // considered for a potential match
              resumeScanAtSamePosition = false;
            } else {
              top.matcher.considerAll();
            }
            top.matcher.lastIndex = index;

            const match = top.matcher.exec(codeToHighlight);
            // console.log("match", match[0], match.rule && match.rule.begin)

            if (!match) break;

            const beforeMatch = codeToHighlight.substring(index, match.index);
            const processedCount = processLexeme(beforeMatch, match);
            index = match.index + processedCount;
          }
          processLexeme(codeToHighlight.substr(index));
          emitter.closeAllNodes();
          emitter.finalize();
          result = emitter.toHTML();

          return {
            // avoid possible breakage with v10 clients expecting
            // this to always be an integer
            relevance: Math.floor(relevance),
            value: result,
            language: languageName,
            illegal: false,
            emitter: emitter,
            top: top
          };
        } catch (err) {
          if (err.message && err.message.includes('Illegal')) {
            return {
              illegal: true,
              illegalBy: {
                msg: err.message,
                context: codeToHighlight.slice(index - 100, index + 100),
                mode: err.mode
              },
              sofar: result,
              relevance: 0,
              value: escape$1$1(codeToHighlight),
              emitter: emitter
            };
          } else if (SAFE_MODE) {
            return {
              illegal: false,
              relevance: 0,
              value: escape$1$1(codeToHighlight),
              emitter: emitter,
              language: languageName,
              top: top,
              errorRaised: err
            };
          } else {
            throw err;
          }
        }
      }

      /**
       * returns a valid highlight result, without actually doing any actual work,
       * auto highlight starts with this and it's possible for small snippets that
       * auto-detection may not find a better match
       * @param {string} code
       * @returns {HighlightResult}
       */
      function justTextHighlightResult(code) {
        const result = {
          relevance: 0,
          emitter: new options.__emitter(options),
          value: escape$1$1(code),
          illegal: false,
          top: PLAINTEXT_LANGUAGE
        };
        result.emitter.addText(code);
        return result;
      }

      /**
      Highlighting with language detection. Accepts a string with the code to
      highlight. Returns an object with the following properties:

      - language (detected language)
      - relevance (int)
      - value (an HTML string with highlighting markup)
      - second_best (object with the same structure for second-best heuristically
        detected language, may be absent)

        @param {string} code
        @param {Array<string>} [languageSubset]
        @returns {AutoHighlightResult}
      */
      function highlightAuto(code, languageSubset) {
        languageSubset = languageSubset || options.languages || Object.keys(languages);
        const plaintext = justTextHighlightResult(code);

        const results = languageSubset.filter(getLanguage).filter(autoDetection).map(name =>
          _highlight(name, code, false)
        );
        results.unshift(plaintext); // plaintext is always an option

        const sorted = results.sort((a, b) => {
          // sort base on relevance
          if (a.relevance !== b.relevance) return b.relevance - a.relevance;

          // always award the tie to the base language
          // ie if C++ and Arduino are tied, it's more likely to be C++
          if (a.language && b.language) {
            if (getLanguage(a.language).supersetOf === b.language) {
              return 1;
            } else if (getLanguage(b.language).supersetOf === a.language) {
              return -1;
            }
          }

          // otherwise say they are equal, which has the effect of sorting on
          // relevance while preserving the original ordering - which is how ties
          // have historically been settled, ie the language that comes first always
          // wins in the case of a tie
          return 0;
        });

        const [best, secondBest] = sorted;

        /** @type {AutoHighlightResult} */
        const result = best;
        result.second_best = secondBest;

        return result;
      }

      /**
      Post-processing of the highlighted markup:

      - replace TABs with something more useful
      - replace real line-breaks with '<br>' for non-pre containers

        @param {string} html
        @returns {string}
      */
      function fixMarkup(html) {
        if (!(options.tabReplace || options.useBR)) {
          return html;
        }

        return html.replace(fixMarkupRe, match => {
          if (match === '\n') {
            return options.useBR ? '<br>' : match;
          } else if (options.tabReplace) {
            return match.replace(/\t/g, options.tabReplace);
          }
          return match;
        });
      }

      /**
       * Builds new class name for block given the language name
       *
       * @param {HTMLElement} element
       * @param {string} [currentLang]
       * @param {string} [resultLang]
       */
      function updateClassName(element, currentLang, resultLang) {
        const language = currentLang ? aliases[currentLang] : resultLang;

        element.classList.add("hljs");
        if (language) element.classList.add(language);
      }

      /** @type {HLJSPlugin} */
      const brPlugin = {
        "before:highlightElement": ({ el }) => {
          if (options.useBR) {
            el.innerHTML = el.innerHTML.replace(/\n/g, '').replace(/<br[ /]*>/g, '\n');
          }
        },
        "after:highlightElement": ({ result }) => {
          if (options.useBR) {
            result.value = result.value.replace(/\n/g, "<br>");
          }
        }
      };

      const TAB_REPLACE_RE = /^(<[^>]+>|\t)+/gm;
      /** @type {HLJSPlugin} */
      const tabReplacePlugin = {
        "after:highlightElement": ({ result }) => {
          if (options.tabReplace) {
            result.value = result.value.replace(TAB_REPLACE_RE, (m) =>
              m.replace(/\t/g, options.tabReplace)
            );
          }
        }
      };

      /**
       * Applies highlighting to a DOM node containing code. Accepts a DOM node and
       * two optional parameters for fixMarkup.
       *
       * @param {HighlightedHTMLElement} element - the HTML element to highlight
      */
      function highlightElement(element) {
        /** @type HTMLElement */
        let node = null;
        const language = blockLanguage(element);

        if (shouldNotHighlight(language)) return;

        // support for v10 API
        fire("before:highlightElement",
          { el: element, language: language });

        node = element;
        const text = node.textContent;
        const result = language ? highlight(text, { language, ignoreIllegals: true }) : highlightAuto(text);

        // support for v10 API
        fire("after:highlightElement", { el: element, result, text });

        element.innerHTML = result.value;
        updateClassName(element, language, result.language);
        element.result = {
          language: result.language,
          // TODO: remove with version 11.0
          re: result.relevance,
          relavance: result.relevance
        };
        if (result.second_best) {
          element.second_best = {
            language: result.second_best.language,
            // TODO: remove with version 11.0
            re: result.second_best.relevance,
            relavance: result.second_best.relevance
          };
        }
      }

      /**
       * Updates highlight.js global options with the passed options
       *
       * @param {Partial<HLJSOptions>} userOptions
       */
      function configure(userOptions) {
        if (userOptions.useBR) {
          deprecated("10.3.0", "'useBR' will be removed entirely in v11.0");
          deprecated("10.3.0", "Please see https://github.com/highlightjs/highlight.js/issues/2559");
        }
        options = inherit$1(options, userOptions);
      }

      /**
       * Highlights to all <pre><code> blocks on a page
       *
       * @type {Function & {called?: boolean}}
       */
      // TODO: remove v12, deprecated
      const initHighlighting = () => {
        if (initHighlighting.called) return;
        initHighlighting.called = true;

        deprecated("10.6.0", "initHighlighting() is deprecated.  Use highlightAll() instead.");

        const blocks = document.querySelectorAll('pre code');
        blocks.forEach(highlightElement);
      };

      // Higlights all when DOMContentLoaded fires
      // TODO: remove v12, deprecated
      function initHighlightingOnLoad() {
        deprecated("10.6.0", "initHighlightingOnLoad() is deprecated.  Use highlightAll() instead.");
        wantsHighlight = true;
      }

      let wantsHighlight = false;

      /**
       * auto-highlights all pre>code elements on the page
       */
      function highlightAll() {
        // if we are called too early in the loading process
        if (document.readyState === "loading") {
          wantsHighlight = true;
          return;
        }

        const blocks = document.querySelectorAll('pre code');
        blocks.forEach(highlightElement);
      }

      function boot() {
        // if a highlight was requested before DOM was loaded, do now
        if (wantsHighlight) highlightAll();
      }

      // make sure we are in the browser environment
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('DOMContentLoaded', boot, false);
      }

      /**
       * Register a language grammar module
       *
       * @param {string} languageName
       * @param {LanguageFn} languageDefinition
       */
      function registerLanguage(languageName, languageDefinition) {
        let lang = null;
        try {
          lang = languageDefinition(hljs);
        } catch (error$1) {
          error("Language definition for '{}' could not be registered.".replace("{}", languageName));
          // hard or soft error
          if (!SAFE_MODE) { throw error$1; } else { error(error$1); }
          // languages that have serious errors are replaced with essentially a
          // "plaintext" stand-in so that the code blocks will still get normal
          // css classes applied to them - and one bad language won't break the
          // entire highlighter
          lang = PLAINTEXT_LANGUAGE;
        }
        // give it a temporary name if it doesn't have one in the meta-data
        if (!lang.name) lang.name = languageName;
        languages[languageName] = lang;
        lang.rawDefinition = languageDefinition.bind(null, hljs);

        if (lang.aliases) {
          registerAliases(lang.aliases, { languageName });
        }
      }

      /**
       * Remove a language grammar module
       *
       * @param {string} languageName
       */
      function unregisterLanguage(languageName) {
        delete languages[languageName];
        for (const alias of Object.keys(aliases)) {
          if (aliases[alias] === languageName) {
            delete aliases[alias];
          }
        }
      }

      /**
       * @returns {string[]} List of language internal names
       */
      function listLanguages() {
        return Object.keys(languages);
      }

      /**
        intended usage: When one language truly requires another

        Unlike `getLanguage`, this will throw when the requested language
        is not available.

        @param {string} name - name of the language to fetch/require
        @returns {Language | never}
      */
      function requireLanguage(name) {
        deprecated("10.4.0", "requireLanguage will be removed entirely in v11.");
        deprecated("10.4.0", "Please see https://github.com/highlightjs/highlight.js/pull/2844");

        const lang = getLanguage(name);
        if (lang) { return lang; }

        const err = new Error('The \'{}\' language is required, but not loaded.'.replace('{}', name));
        throw err;
      }

      /**
       * @param {string} name - name of the language to retrieve
       * @returns {Language | undefined}
       */
      function getLanguage(name) {
        name = (name || '').toLowerCase();
        return languages[name] || languages[aliases[name]];
      }

      /**
       *
       * @param {string|string[]} aliasList - single alias or list of aliases
       * @param {{languageName: string}} opts
       */
      function registerAliases(aliasList, { languageName }) {
        if (typeof aliasList === 'string') {
          aliasList = [aliasList];
        }
        aliasList.forEach(alias => { aliases[alias.toLowerCase()] = languageName; });
      }

      /**
       * Determines if a given language has auto-detection enabled
       * @param {string} name - name of the language
       */
      function autoDetection(name) {
        const lang = getLanguage(name);
        return lang && !lang.disableAutodetect;
      }

      /**
       * Upgrades the old highlightBlock plugins to the new
       * highlightElement API
       * @param {HLJSPlugin} plugin
       */
      function upgradePluginAPI(plugin) {
        // TODO: remove with v12
        if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
          plugin["before:highlightElement"] = (data) => {
            plugin["before:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
        if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
          plugin["after:highlightElement"] = (data) => {
            plugin["after:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
      }

      /**
       * @param {HLJSPlugin} plugin
       */
      function addPlugin(plugin) {
        upgradePluginAPI(plugin);
        plugins.push(plugin);
      }

      /**
       *
       * @param {PluginEvent} event
       * @param {any} args
       */
      function fire(event, args) {
        const cb = event;
        plugins.forEach(function(plugin) {
          if (plugin[cb]) {
            plugin[cb](args);
          }
        });
      }

      /**
      Note: fixMarkup is deprecated and will be removed entirely in v11

      @param {string} arg
      @returns {string}
      */
      function deprecateFixMarkup(arg) {
        deprecated("10.2.0", "fixMarkup will be removed entirely in v11.0");
        deprecated("10.2.0", "Please see https://github.com/highlightjs/highlight.js/issues/2534");

        return fixMarkup(arg);
      }

      /**
       *
       * @param {HighlightedHTMLElement} el
       */
      function deprecateHighlightBlock(el) {
        deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
        deprecated("10.7.0", "Please use highlightElement now.");

        return highlightElement(el);
      }

      /* Interface definition */
      Object.assign(hljs, {
        highlight,
        highlightAuto,
        highlightAll,
        fixMarkup: deprecateFixMarkup,
        highlightElement,
        // TODO: Remove with v12 API
        highlightBlock: deprecateHighlightBlock,
        configure,
        initHighlighting,
        initHighlightingOnLoad,
        registerLanguage,
        unregisterLanguage,
        listLanguages,
        getLanguage,
        registerAliases,
        requireLanguage,
        autoDetection,
        inherit: inherit$1,
        addPlugin,
        // plugins for frameworks
        vuePlugin: BuildVuePlugin(hljs).VuePlugin
      });

      hljs.debugMode = function() { SAFE_MODE = false; };
      hljs.safeMode = function() { SAFE_MODE = true; };
      hljs.versionString = version;

      for (const key in MODES) {
        // @ts-ignore
        if (typeof MODES[key] === "object") {
          // @ts-ignore
          deepFreezeEs6(MODES[key]);
        }
      }

      // merge all the modes/regexs into our main object
      Object.assign(hljs, MODES);

      // built-in plugins, likely to be moved out of core in the future
      hljs.addPlugin(brPlugin); // slated to be removed in v11
      hljs.addPlugin(mergeHTMLPlugin);
      hljs.addPlugin(tabReplacePlugin);
      return hljs;
    };

    // export an "instance" of the highlighter
    var highlight = HLJS({});

    var core = highlight;

    const IDENT_RE$1 = '[A-Za-z$_][0-9A-Za-z$_]*';
    const KEYWORDS = [
      "as", // for exports
      "in",
      "of",
      "if",
      "for",
      "while",
      "finally",
      "var",
      "new",
      "function",
      "do",
      "return",
      "void",
      "else",
      "break",
      "catch",
      "instanceof",
      "with",
      "throw",
      "case",
      "default",
      "try",
      "switch",
      "continue",
      "typeof",
      "delete",
      "let",
      "yield",
      "const",
      "class",
      // JS handles these with a special rule
      // "get",
      // "set",
      "debugger",
      "async",
      "await",
      "static",
      "import",
      "from",
      "export",
      "extends"
    ];
    const LITERALS = [
      "true",
      "false",
      "null",
      "undefined",
      "NaN",
      "Infinity"
    ];

    const TYPES = [
      "Intl",
      "DataView",
      "Number",
      "Math",
      "Date",
      "String",
      "RegExp",
      "Object",
      "Function",
      "Boolean",
      "Error",
      "Symbol",
      "Set",
      "Map",
      "WeakSet",
      "WeakMap",
      "Proxy",
      "Reflect",
      "JSON",
      "Promise",
      "Float64Array",
      "Int16Array",
      "Int32Array",
      "Int8Array",
      "Uint16Array",
      "Uint32Array",
      "Float32Array",
      "Array",
      "Uint8Array",
      "Uint8ClampedArray",
      "ArrayBuffer",
      "BigInt64Array",
      "BigUint64Array",
      "BigInt"
    ];

    const ERROR_TYPES = [
      "EvalError",
      "InternalError",
      "RangeError",
      "ReferenceError",
      "SyntaxError",
      "TypeError",
      "URIError"
    ];

    const BUILT_IN_GLOBALS = [
      "setInterval",
      "setTimeout",
      "clearInterval",
      "clearTimeout",

      "require",
      "exports",

      "eval",
      "isFinite",
      "isNaN",
      "parseFloat",
      "parseInt",
      "decodeURI",
      "decodeURIComponent",
      "encodeURI",
      "encodeURIComponent",
      "escape",
      "unescape"
    ];

    const BUILT_IN_VARIABLES = [
      "arguments",
      "this",
      "super",
      "console",
      "window",
      "document",
      "localStorage",
      "module",
      "global" // Node.js
    ];

    const BUILT_INS = [].concat(
      BUILT_IN_GLOBALS,
      BUILT_IN_VARIABLES,
      TYPES,
      ERROR_TYPES
    );

    /**
     * @param {string} value
     * @returns {RegExp}
     * */

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function source$1(re) {
      if (!re) return null;
      if (typeof re === "string") return re;

      return re.source;
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function lookahead(re) {
      return concat$1('(?=', re, ')');
    }

    /**
     * @param {...(RegExp | string) } args
     * @returns {string}
     */
    function concat$1(...args) {
      const joined = args.map((x) => source$1(x)).join("");
      return joined;
    }

    /*
    Language: JavaScript
    Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
    Category: common, scripting
    Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
    */

    /** @type LanguageFn */
    function javascript(hljs) {
      /**
       * Takes a string like "<Booger" and checks to see
       * if we can find a matching "</Booger" later in the
       * content.
       * @param {RegExpMatchArray} match
       * @param {{after:number}} param1
       */
      const hasClosingTag = (match, { after }) => {
        const tag = "</" + match[0].slice(1);
        const pos = match.input.indexOf(tag, after);
        return pos !== -1;
      };

      const IDENT_RE$1$1 = IDENT_RE$1;
      const FRAGMENT = {
        begin: '<>',
        end: '</>'
      };
      const XML_TAG = {
        begin: /<[A-Za-z0-9\\._:-]+/,
        end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
        /**
         * @param {RegExpMatchArray} match
         * @param {CallbackResponse} response
         */
        isTrulyOpeningTag: (match, response) => {
          const afterMatchIndex = match[0].length + match.index;
          const nextChar = match.input[afterMatchIndex];
          // nested type?
          // HTML should not include another raw `<` inside a tag
          // But a type might: `<Array<Array<number>>`, etc.
          if (nextChar === "<") {
            response.ignoreMatch();
            return;
          }
          // <something>
          // This is now either a tag or a type.
          if (nextChar === ">") {
            // if we cannot find a matching closing tag, then we
            // will ignore it
            if (!hasClosingTag(match, { after: afterMatchIndex })) {
              response.ignoreMatch();
            }
          }
        }
      };
      const KEYWORDS$1 = {
        $pattern: IDENT_RE$1,
        keyword: KEYWORDS,
        literal: LITERALS,
        built_in: BUILT_INS
      };

      // https://tc39.es/ecma262/#sec-literals-numeric-literals
      const decimalDigits = '[0-9](_?[0-9])*';
      const frac = `\\.(${decimalDigits})`;
      // DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
      const NUMBER = {
        className: 'number',
        variants: [
          // DecimalLiteral
          { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
            `[eE][+-]?(${decimalDigits})\\b` },
          { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

          // DecimalBigIntegerLiteral
          { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },

          // NonDecimalIntegerLiteral
          { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
          { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
          { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },

          // LegacyOctalIntegerLiteral (does not include underscore separators)
          // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
          { begin: "\\b0[0-7]+n?\\b" },
        ],
        relevance: 0
      };

      const SUBST = {
        className: 'subst',
        begin: '\\$\\{',
        end: '\\}',
        keywords: KEYWORDS$1,
        contains: [] // defined later
      };
      const HTML_TEMPLATE = {
        begin: 'html`',
        end: '',
        starts: {
          end: '`',
          returnEnd: false,
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          subLanguage: 'xml'
        }
      };
      const CSS_TEMPLATE = {
        begin: 'css`',
        end: '',
        starts: {
          end: '`',
          returnEnd: false,
          contains: [
            hljs.BACKSLASH_ESCAPE,
            SUBST
          ],
          subLanguage: 'css'
        }
      };
      const TEMPLATE_STRING = {
        className: 'string',
        begin: '`',
        end: '`',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST
        ]
      };
      const JSDOC_COMMENT = hljs.COMMENT(
        /\/\*\*(?!\/)/,
        '\\*/',
        {
          relevance: 0,
          contains: [
            {
              className: 'doctag',
              begin: '@[A-Za-z]+',
              contains: [
                {
                  className: 'type',
                  begin: '\\{',
                  end: '\\}',
                  relevance: 0
                },
                {
                  className: 'variable',
                  begin: IDENT_RE$1$1 + '(?=\\s*(-)|$)',
                  endsParent: true,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      );
      const COMMENT = {
        className: "comment",
        variants: [
          JSDOC_COMMENT,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.C_LINE_COMMENT_MODE
        ]
      };
      const SUBST_INTERNALS = [
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE,
        HTML_TEMPLATE,
        CSS_TEMPLATE,
        TEMPLATE_STRING,
        NUMBER,
        hljs.REGEXP_MODE
      ];
      SUBST.contains = SUBST_INTERNALS
        .concat({
          // we need to pair up {} inside our subst to prevent
          // it from ending too early by matching another }
          begin: /\{/,
          end: /\}/,
          keywords: KEYWORDS$1,
          contains: [
            "self"
          ].concat(SUBST_INTERNALS)
        });
      const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
      const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
        // eat recursive parens in sub expressions
        {
          begin: /\(/,
          end: /\)/,
          keywords: KEYWORDS$1,
          contains: ["self"].concat(SUBST_AND_COMMENTS)
        }
      ]);
      const PARAMS = {
        className: 'params',
        begin: /\(/,
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS$1,
        contains: PARAMS_CONTAINS
      };

      return {
        name: 'Javascript',
        aliases: ['js', 'jsx', 'mjs', 'cjs'],
        keywords: KEYWORDS$1,
        // this will be extended by TypeScript
        exports: { PARAMS_CONTAINS },
        illegal: /#(?![$_A-z])/,
        contains: [
          hljs.SHEBANG({
            label: "shebang",
            binary: "node",
            relevance: 5
          }),
          {
            label: "use_strict",
            className: 'meta',
            relevance: 10,
            begin: /^\s*['"]use (strict|asm)['"]/
          },
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          HTML_TEMPLATE,
          CSS_TEMPLATE,
          TEMPLATE_STRING,
          COMMENT,
          NUMBER,
          { // object attr container
            begin: concat$1(/[{,\n]\s*/,
              // we need to look ahead to make sure that we actually have an
              // attribute coming up so we don't steal a comma from a potential
              // "value" container
              //
              // NOTE: this might not work how you think.  We don't actually always
              // enter this mode and stay.  Instead it might merely match `,
              // <comments up next>` and then immediately end after the , because it
              // fails to find any actual attrs. But this still does the job because
              // it prevents the value contain rule from grabbing this instead and
              // prevening this rule from firing when we actually DO have keys.
              lookahead(concat$1(
                // we also need to allow for multiple possible comments inbetween
                // the first key:value pairing
                /(((\/\/.*$)|(\/\*(\*[^/]|[^*])*\*\/))\s*)*/,
                IDENT_RE$1$1 + '\\s*:'))),
            relevance: 0,
            contains: [
              {
                className: 'attr',
                begin: IDENT_RE$1$1 + lookahead('\\s*:'),
                relevance: 0
              }
            ]
          },
          { // "value" container
            begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
            keywords: 'return throw case',
            contains: [
              COMMENT,
              hljs.REGEXP_MODE,
              {
                className: 'function',
                // we have to count the parens to make sure we actually have the
                // correct bounding ( ) before the =>.  There could be any number of
                // sub-expressions inside also surrounded by parens.
                begin: '(\\(' +
                '[^()]*(\\(' +
                '[^()]*(\\(' +
                '[^()]*' +
                '\\)[^()]*)*' +
                '\\)[^()]*)*' +
                '\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>',
                returnBegin: true,
                end: '\\s*=>',
                contains: [
                  {
                    className: 'params',
                    variants: [
                      {
                        begin: hljs.UNDERSCORE_IDENT_RE,
                        relevance: 0
                      },
                      {
                        className: null,
                        begin: /\(\s*\)/,
                        skip: true
                      },
                      {
                        begin: /\(/,
                        end: /\)/,
                        excludeBegin: true,
                        excludeEnd: true,
                        keywords: KEYWORDS$1,
                        contains: PARAMS_CONTAINS
                      }
                    ]
                  }
                ]
              },
              { // could be a comma delimited list of params to a function call
                begin: /,/, relevance: 0
              },
              {
                className: '',
                begin: /\s/,
                end: /\s*/,
                skip: true
              },
              { // JSX
                variants: [
                  { begin: FRAGMENT.begin, end: FRAGMENT.end },
                  {
                    begin: XML_TAG.begin,
                    // we carefully check the opening tag to see if it truly
                    // is a tag and not a false positive
                    'on:begin': XML_TAG.isTrulyOpeningTag,
                    end: XML_TAG.end
                  }
                ],
                subLanguage: 'xml',
                contains: [
                  {
                    begin: XML_TAG.begin,
                    end: XML_TAG.end,
                    skip: true,
                    contains: ['self']
                  }
                ]
              }
            ],
            relevance: 0
          },
          {
            className: 'function',
            beginKeywords: 'function',
            end: /[{;]/,
            excludeEnd: true,
            keywords: KEYWORDS$1,
            contains: [
              'self',
              hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1$1 }),
              PARAMS
            ],
            illegal: /%/
          },
          {
            // prevent this from getting swallowed up by function
            // since they appear "function like"
            beginKeywords: "while if switch catch for"
          },
          {
            className: 'function',
            // we have to count the parens to make sure we actually have the correct
            // bounding ( ).  There could be any number of sub-expressions inside
            // also surrounded by parens.
            begin: hljs.UNDERSCORE_IDENT_RE +
              '\\(' + // first parens
              '[^()]*(\\(' +
                '[^()]*(\\(' +
                  '[^()]*' +
                '\\)[^()]*)*' +
              '\\)[^()]*)*' +
              '\\)\\s*\\{', // end parens
            returnBegin:true,
            contains: [
              PARAMS,
              hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1$1 }),
            ]
          },
          // hack: prevents detection of keywords in some circumstances
          // .keyword()
          // $keyword = x
          {
            variants: [
              { begin: '\\.' + IDENT_RE$1$1 },
              { begin: '\\$' + IDENT_RE$1$1 }
            ],
            relevance: 0
          },
          { // ES6 class
            className: 'class',
            beginKeywords: 'class',
            end: /[{;=]/,
            excludeEnd: true,
            illegal: /[:"[\]]/,
            contains: [
              { beginKeywords: 'extends' },
              hljs.UNDERSCORE_TITLE_MODE
            ]
          },
          {
            begin: /\b(?=constructor)/,
            end: /[{;]/,
            excludeEnd: true,
            contains: [
              hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1$1 }),
              'self',
              PARAMS
            ]
          },
          {
            begin: '(get|set)\\s+(?=' + IDENT_RE$1$1 + '\\()',
            end: /\{/,
            keywords: "get set",
            contains: [
              hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1$1 }),
              { begin: /\(\)/ }, // eat to avoid empty params
              PARAMS
            ]
          },
          {
            begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
          }
        ]
      };
    }

    var javascript_1 = javascript;

    /**
     * @param {string} value
     * @returns {RegExp}
     * */

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function source$2(re) {
      if (!re) return null;
      if (typeof re === "string") return re;

      return re.source;
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function lookahead$1(re) {
      return concat$2('(?=', re, ')');
    }

    /**
     * @param {...(RegExp | string) } args
     * @returns {string}
     */
    function concat$2(...args) {
      const joined = args.map((x) => source$2(x)).join("");
      return joined;
    }

    /*
    Language: Python
    Description: Python is an interpreted, object-oriented, high-level programming language with dynamic semantics.
    Website: https://www.python.org
    Category: common
    */

    function python(hljs) {
      const RESERVED_WORDS = [
        'and',
        'as',
        'assert',
        'async',
        'await',
        'break',
        'class',
        'continue',
        'def',
        'del',
        'elif',
        'else',
        'except',
        'finally',
        'for',
        'from',
        'global',
        'if',
        'import',
        'in',
        'is',
        'lambda',
        'nonlocal|10',
        'not',
        'or',
        'pass',
        'raise',
        'return',
        'try',
        'while',
        'with',
        'yield'
      ];

      const BUILT_INS = [
        '__import__',
        'abs',
        'all',
        'any',
        'ascii',
        'bin',
        'bool',
        'breakpoint',
        'bytearray',
        'bytes',
        'callable',
        'chr',
        'classmethod',
        'compile',
        'complex',
        'delattr',
        'dict',
        'dir',
        'divmod',
        'enumerate',
        'eval',
        'exec',
        'filter',
        'float',
        'format',
        'frozenset',
        'getattr',
        'globals',
        'hasattr',
        'hash',
        'help',
        'hex',
        'id',
        'input',
        'int',
        'isinstance',
        'issubclass',
        'iter',
        'len',
        'list',
        'locals',
        'map',
        'max',
        'memoryview',
        'min',
        'next',
        'object',
        'oct',
        'open',
        'ord',
        'pow',
        'print',
        'property',
        'range',
        'repr',
        'reversed',
        'round',
        'set',
        'setattr',
        'slice',
        'sorted',
        'staticmethod',
        'str',
        'sum',
        'super',
        'tuple',
        'type',
        'vars',
        'zip'
      ];

      const LITERALS = [
        '__debug__',
        'Ellipsis',
        'False',
        'None',
        'NotImplemented',
        'True'
      ];

      // https://docs.python.org/3/library/typing.html
      // TODO: Could these be supplemented by a CamelCase matcher in certain
      // contexts, leaving these remaining only for relevance hinting?
      const TYPES = [
        "Any",
        "Callable",
        "Coroutine",
        "Dict",
        "List",
        "Literal",
        "Generic",
        "Optional",
        "Sequence",
        "Set",
        "Tuple",
        "Type",
        "Union"
      ];

      const KEYWORDS = {
        $pattern: /[A-Za-z]\w+|__\w+__/,
        keyword: RESERVED_WORDS,
        built_in: BUILT_INS,
        literal: LITERALS,
        type: TYPES
      };

      const PROMPT = {
        className: 'meta',
        begin: /^(>>>|\.\.\.) /
      };

      const SUBST = {
        className: 'subst',
        begin: /\{/,
        end: /\}/,
        keywords: KEYWORDS,
        illegal: /#/
      };

      const LITERAL_BRACKET = {
        begin: /\{\{/,
        relevance: 0
      };

      const STRING = {
        className: 'string',
        contains: [ hljs.BACKSLASH_ESCAPE ],
        variants: [
          {
            begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
            end: /'''/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              PROMPT
            ],
            relevance: 10
          },
          {
            begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
            end: /"""/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              PROMPT
            ],
            relevance: 10
          },
          {
            begin: /([fF][rR]|[rR][fF]|[fF])'''/,
            end: /'''/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              PROMPT,
              LITERAL_BRACKET,
              SUBST
            ]
          },
          {
            begin: /([fF][rR]|[rR][fF]|[fF])"""/,
            end: /"""/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              PROMPT,
              LITERAL_BRACKET,
              SUBST
            ]
          },
          {
            begin: /([uU]|[rR])'/,
            end: /'/,
            relevance: 10
          },
          {
            begin: /([uU]|[rR])"/,
            end: /"/,
            relevance: 10
          },
          {
            begin: /([bB]|[bB][rR]|[rR][bB])'/,
            end: /'/
          },
          {
            begin: /([bB]|[bB][rR]|[rR][bB])"/,
            end: /"/
          },
          {
            begin: /([fF][rR]|[rR][fF]|[fF])'/,
            end: /'/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              LITERAL_BRACKET,
              SUBST
            ]
          },
          {
            begin: /([fF][rR]|[rR][fF]|[fF])"/,
            end: /"/,
            contains: [
              hljs.BACKSLASH_ESCAPE,
              LITERAL_BRACKET,
              SUBST
            ]
          },
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE
        ]
      };

      // https://docs.python.org/3.9/reference/lexical_analysis.html#numeric-literals
      const digitpart = '[0-9](_?[0-9])*';
      const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
      const NUMBER = {
        className: 'number',
        relevance: 0,
        variants: [
          // exponentfloat, pointfloat
          // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
          // optionally imaginary
          // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
          // Note: no leading \b because floats can start with a decimal point
          // and we don't want to mishandle e.g. `fn(.5)`,
          // no trailing \b for pointfloat because it can end with a decimal point
          // and we don't want to mishandle e.g. `0..hex()`; this should be safe
          // because both MUST contain a decimal point and so cannot be confused with
          // the interior part of an identifier
          {
            begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?\\b`
          },
          {
            begin: `(${pointfloat})[jJ]?`
          },

          // decinteger, bininteger, octinteger, hexinteger
          // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
          // optionally "long" in Python 2
          // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
          // decinteger is optionally imaginary
          // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
          {
            begin: '\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?\\b'
          },
          {
            begin: '\\b0[bB](_?[01])+[lL]?\\b'
          },
          {
            begin: '\\b0[oO](_?[0-7])+[lL]?\\b'
          },
          {
            begin: '\\b0[xX](_?[0-9a-fA-F])+[lL]?\\b'
          },

          // imagnumber (digitpart-based)
          // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
          {
            begin: `\\b(${digitpart})[jJ]\\b`
          }
        ]
      };
      const COMMENT_TYPE = {
        className: "comment",
        begin: lookahead$1(/# type:/),
        end: /$/,
        keywords: KEYWORDS,
        contains: [
          { // prevent keywords from coloring `type`
            begin: /# type:/
          },
          // comment within a datatype comment includes no keywords
          {
            begin: /#/,
            end: /\b\B/,
            endsWithParent: true
          }
        ]
      };
      const PARAMS = {
        className: 'params',
        variants: [
          // Exclude params in functions without params
          {
            className: "",
            begin: /\(\s*\)/,
            skip: true
          },
          {
            begin: /\(/,
            end: /\)/,
            excludeBegin: true,
            excludeEnd: true,
            keywords: KEYWORDS,
            contains: [
              'self',
              PROMPT,
              NUMBER,
              STRING,
              hljs.HASH_COMMENT_MODE
            ]
          }
        ]
      };
      SUBST.contains = [
        STRING,
        NUMBER,
        PROMPT
      ];

      return {
        name: 'Python',
        aliases: [
          'py',
          'gyp',
          'ipython'
        ],
        keywords: KEYWORDS,
        illegal: /(<\/|->|\?)|=>/,
        contains: [
          PROMPT,
          NUMBER,
          {
            // very common convention
            begin: /\bself\b/
          },
          {
            // eat "if" prior to string so that it won't accidentally be
            // labeled as an f-string
            beginKeywords: "if",
            relevance: 0
          },
          STRING,
          COMMENT_TYPE,
          hljs.HASH_COMMENT_MODE,
          {
            variants: [
              {
                className: 'function',
                beginKeywords: 'def'
              },
              {
                className: 'class',
                beginKeywords: 'class'
              }
            ],
            end: /:/,
            illegal: /[${=;\n,]/,
            contains: [
              hljs.UNDERSCORE_TITLE_MODE,
              PARAMS,
              {
                begin: /->/,
                endsWithParent: true,
                keywords: KEYWORDS
              }
            ]
          },
          {
            className: 'meta',
            begin: /^[\t ]*@/,
            end: /(?=#)|$/,
            contains: [
              NUMBER,
              PARAMS,
              STRING
            ]
          }
        ]
      };
    }

    var python_1 = python;

    /**
     * @param {string} value
     * @returns {RegExp}
     * */

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function source$3(re) {
      if (!re) return null;
      if (typeof re === "string") return re;

      return re.source;
    }

    /**
     * @param {...(RegExp | string) } args
     * @returns {string}
     */
    function concat$3(...args) {
      const joined = args.map((x) => source$3(x)).join("");
      return joined;
    }

    /*
    Language: Bash
    Author: vah <vahtenberg@gmail.com>
    Contributrors: Benjamin Pannell <contact@sierrasoftworks.com>
    Website: https://www.gnu.org/software/bash/
    Category: common
    */

    /** @type LanguageFn */
    function bash(hljs) {
      const VAR = {};
      const BRACED_VAR = {
        begin: /\$\{/,
        end:/\}/,
        contains: [
          "self",
          {
            begin: /:-/,
            contains: [ VAR ]
          } // default values
        ]
      };
      Object.assign(VAR,{
        className: 'variable',
        variants: [
          {begin: concat$3(/\$[\w\d#@][\w\d_]*/,
            // negative look-ahead tries to avoid matching patterns that are not
            // Perl at all like $ident$, @ident@, etc.
            `(?![\\w\\d])(?![$])`) },
          BRACED_VAR
        ]
      });

      const SUBST = {
        className: 'subst',
        begin: /\$\(/, end: /\)/,
        contains: [hljs.BACKSLASH_ESCAPE]
      };
      const HERE_DOC = {
        begin: /<<-?\s*(?=\w+)/,
        starts: {
          contains: [
            hljs.END_SAME_AS_BEGIN({
              begin: /(\w+)/,
              end: /(\w+)/,
              className: 'string'
            })
          ]
        }
      };
      const QUOTE_STRING = {
        className: 'string',
        begin: /"/, end: /"/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          VAR,
          SUBST
        ]
      };
      SUBST.contains.push(QUOTE_STRING);
      const ESCAPED_QUOTE = {
        className: '',
        begin: /\\"/

      };
      const APOS_STRING = {
        className: 'string',
        begin: /'/, end: /'/
      };
      const ARITHMETIC = {
        begin: /\$\(\(/,
        end: /\)\)/,
        contains: [
          { begin: /\d+#[0-9a-f]+/, className: "number" },
          hljs.NUMBER_MODE,
          VAR
        ]
      };
      const SH_LIKE_SHELLS = [
        "fish",
        "bash",
        "zsh",
        "sh",
        "csh",
        "ksh",
        "tcsh",
        "dash",
        "scsh",
      ];
      const KNOWN_SHEBANG = hljs.SHEBANG({
        binary: `(${SH_LIKE_SHELLS.join("|")})`,
        relevance: 10
      });
      const FUNCTION = {
        className: 'function',
        begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
        returnBegin: true,
        contains: [hljs.inherit(hljs.TITLE_MODE, {begin: /\w[\w\d_]*/})],
        relevance: 0
      };

      return {
        name: 'Bash',
        aliases: ['sh', 'zsh'],
        keywords: {
          $pattern: /\b[a-z._-]+\b/,
          keyword:
            'if then else elif fi for while in do done case esac function',
          literal:
            'true false',
          built_in:
            // Shell built-ins
            // http://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
            'break cd continue eval exec exit export getopts hash pwd readonly return shift test times ' +
            'trap umask unset ' +
            // Bash built-ins
            'alias bind builtin caller command declare echo enable help let local logout mapfile printf ' +
            'read readarray source type typeset ulimit unalias ' +
            // Shell modifiers
            'set shopt ' +
            // Zsh built-ins
            'autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles ' +
            'compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate ' +
            'fc fg float functions getcap getln history integer jobs kill limit log noglob popd print ' +
            'pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit ' +
            'unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof ' +
            'zpty zregexparse zsocket zstyle ztcp'
        },
        contains: [
          KNOWN_SHEBANG, // to catch known shells and boost relevancy
          hljs.SHEBANG(), // to catch unknown shells but still highlight the shebang
          FUNCTION,
          ARITHMETIC,
          hljs.HASH_COMMENT_MODE,
          HERE_DOC,
          QUOTE_STRING,
          ESCAPED_QUOTE,
          APOS_STRING,
          VAR
        ]
      };
    }

    var bash_1 = bash;

    /**
     * @param {string} value
     * @returns {RegExp}
     * */

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function source$4(re) {
      if (!re) return null;
      if (typeof re === "string") return re;

      return re.source;
    }

    /**
     * @param {RegExp | string } re
     * @returns {string}
     */
    function lookahead$2(re) {
      return concat$4('(?=', re, ')');
    }

    /**
     * @param {...(RegExp | string) } args
     * @returns {string}
     */
    function concat$4(...args) {
      const joined = args.map((x) => source$4(x)).join("");
      return joined;
    }

    /*
    Language: Ruby
    Description: Ruby is a dynamic, open source programming language with a focus on simplicity and productivity.
    Website: https://www.ruby-lang.org/
    Author: Anton Kovalyov <anton@kovalyov.net>
    Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>, Pascal Hurni <phi@ruby-reactive.org>, Cedric Sohrauer <sohrauer@googlemail.com>
    Category: common
    */

    function ruby(hljs) {
      const RUBY_METHOD_RE = '([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)';
      const RUBY_KEYWORDS = {
        keyword:
          'and then defined module in return redo if BEGIN retry end for self when ' +
          'next until do begin unless END rescue else break undef not super class case ' +
          'require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor ' +
          '__FILE__',
        built_in: 'proc lambda',
        literal:
          'true false nil'
      };
      const YARDOCTAG = {
        className: 'doctag',
        begin: '@[A-Za-z]+'
      };
      const IRB_OBJECT = {
        begin: '#<',
        end: '>'
      };
      const COMMENT_MODES = [
        hljs.COMMENT(
          '#',
          '$',
          {
            contains: [ YARDOCTAG ]
          }
        ),
        hljs.COMMENT(
          '^=begin',
          '^=end',
          {
            contains: [ YARDOCTAG ],
            relevance: 10
          }
        ),
        hljs.COMMENT('^__END__', '\\n$')
      ];
      const SUBST = {
        className: 'subst',
        begin: /#\{/,
        end: /\}/,
        keywords: RUBY_KEYWORDS
      };
      const STRING = {
        className: 'string',
        contains: [
          hljs.BACKSLASH_ESCAPE,
          SUBST
        ],
        variants: [
          {
            begin: /'/,
            end: /'/
          },
          {
            begin: /"/,
            end: /"/
          },
          {
            begin: /`/,
            end: /`/
          },
          {
            begin: /%[qQwWx]?\(/,
            end: /\)/
          },
          {
            begin: /%[qQwWx]?\[/,
            end: /\]/
          },
          {
            begin: /%[qQwWx]?\{/,
            end: /\}/
          },
          {
            begin: /%[qQwWx]?</,
            end: />/
          },
          {
            begin: /%[qQwWx]?\//,
            end: /\//
          },
          {
            begin: /%[qQwWx]?%/,
            end: /%/
          },
          {
            begin: /%[qQwWx]?-/,
            end: /-/
          },
          {
            begin: /%[qQwWx]?\|/,
            end: /\|/
          },
          // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
          // where ? is the last character of a preceding identifier, as in: `func?4`
          {
            begin: /\B\?(\\\d{1,3})/
          },
          {
            begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/
          },
          {
            begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/
          },
          {
            begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/
          },
          {
            begin: /\B\?\\(c|C-)[\x20-\x7e]/
          },
          {
            begin: /\B\?\\?\S/
          },
          { // heredocs
            begin: /<<[-~]?'?(\w+)\n(?:[^\n]*\n)*?\s*\1\b/,
            returnBegin: true,
            contains: [
              {
                begin: /<<[-~]?'?/
              },
              hljs.END_SAME_AS_BEGIN({
                begin: /(\w+)/,
                end: /(\w+)/,
                contains: [
                  hljs.BACKSLASH_ESCAPE,
                  SUBST
                ]
              })
            ]
          }
        ]
      };

      // Ruby syntax is underdocumented, but this grammar seems to be accurate
      // as of version 2.7.2 (confirmed with (irb and `Ripper.sexp(...)`)
      // https://docs.ruby-lang.org/en/2.7.0/doc/syntax/literals_rdoc.html#label-Numbers
      const decimal = '[1-9](_?[0-9])*|0';
      const digits = '[0-9](_?[0-9])*';
      const NUMBER = {
        className: 'number',
        relevance: 0,
        variants: [
          // decimal integer/float, optionally exponential or rational, optionally imaginary
          {
            begin: `\\b(${decimal})(\\.(${digits}))?([eE][+-]?(${digits})|r)?i?\\b`
          },

          // explicit decimal/binary/octal/hexadecimal integer,
          // optionally rational and/or imaginary
          {
            begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b"
          },
          {
            begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b"
          },
          {
            begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b"
          },
          {
            begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b"
          },

          // 0-prefixed implicit octal integer, optionally rational and/or imaginary
          {
            begin: "\\b0(_?[0-7])+r?i?\\b"
          }
        ]
      };

      const PARAMS = {
        className: 'params',
        begin: '\\(',
        end: '\\)',
        endsParent: true,
        keywords: RUBY_KEYWORDS
      };

      const RUBY_DEFAULT_CONTAINS = [
        STRING,
        {
          className: 'class',
          beginKeywords: 'class module',
          end: '$|;',
          illegal: /=/,
          contains: [
            hljs.inherit(hljs.TITLE_MODE, {
              begin: '[A-Za-z_]\\w*(::\\w+)*(\\?|!)?'
            }),
            {
              begin: '<\\s*',
              contains: [
                {
                  begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE,
                  // we already get points for <, we don't need poitns
                  // for the name also
                  relevance: 0
                }
              ]
            }
          ].concat(COMMENT_MODES)
        },
        {
          className: 'function',
          // def method_name(
          // def method_name;
          // def method_name (end of line)
          begin: concat$4(/def\s+/, lookahead$2(RUBY_METHOD_RE + "\\s*(\\(|;|$)")),
          relevance: 0, // relevance comes from kewords
          keywords: "def",
          end: '$|;',
          contains: [
            hljs.inherit(hljs.TITLE_MODE, {
              begin: RUBY_METHOD_RE
            }),
            PARAMS
          ].concat(COMMENT_MODES)
        },
        {
          // swallow namespace qualifiers before symbols
          begin: hljs.IDENT_RE + '::'
        },
        {
          className: 'symbol',
          begin: hljs.UNDERSCORE_IDENT_RE + '(!|\\?)?:',
          relevance: 0
        },
        {
          className: 'symbol',
          begin: ':(?!\\s)',
          contains: [
            STRING,
            {
              begin: RUBY_METHOD_RE
            }
          ],
          relevance: 0
        },
        NUMBER,
        {
          // negative-look forward attemps to prevent false matches like:
          // @ident@ or $ident$ that might indicate this is not ruby at all
          className: "variable",
          begin: '(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])' + `(?![A-Za-z])(?![@$?'])`
        },
        {
          className: 'params',
          begin: /\|/,
          end: /\|/,
          relevance: 0, // this could be a lot of things (in other languages) other than params
          keywords: RUBY_KEYWORDS
        },
        { // regexp container
          begin: '(' + hljs.RE_STARTERS_RE + '|unless)\\s*',
          keywords: 'unless',
          contains: [
            {
              className: 'regexp',
              contains: [
                hljs.BACKSLASH_ESCAPE,
                SUBST
              ],
              illegal: /\n/,
              variants: [
                {
                  begin: '/',
                  end: '/[a-z]*'
                },
                {
                  begin: /%r\{/,
                  end: /\}[a-z]*/
                },
                {
                  begin: '%r\\(',
                  end: '\\)[a-z]*'
                },
                {
                  begin: '%r!',
                  end: '![a-z]*'
                },
                {
                  begin: '%r\\[',
                  end: '\\][a-z]*'
                }
              ]
            }
          ].concat(IRB_OBJECT, COMMENT_MODES),
          relevance: 0
        }
      ].concat(IRB_OBJECT, COMMENT_MODES);

      SUBST.contains = RUBY_DEFAULT_CONTAINS;
      PARAMS.contains = RUBY_DEFAULT_CONTAINS;

      // >>
      // ?>
      const SIMPLE_PROMPT = "[>?]>";
      // irb(main):001:0>
      const DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+>";
      const RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>";

      const IRB_DEFAULT = [
        {
          begin: /^\s*=>/,
          starts: {
            end: '$',
            contains: RUBY_DEFAULT_CONTAINS
          }
        },
        {
          className: 'meta',
          begin: '^(' + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + '|' + RVM_PROMPT + ')(?=[ ])',
          starts: {
            end: '$',
            contains: RUBY_DEFAULT_CONTAINS
          }
        }
      ];

      COMMENT_MODES.unshift(IRB_OBJECT);

      return {
        name: 'Ruby',
        aliases: [
          'rb',
          'gemspec',
          'podspec',
          'thor',
          'irb'
        ],
        keywords: RUBY_KEYWORDS,
        illegal: /\/\*/,
        contains: [
          hljs.SHEBANG({
            binary: "ruby"
          })
        ]
          .concat(IRB_DEFAULT)
          .concat(COMMENT_MODES)
          .concat(RUBY_DEFAULT_CONTAINS)
      };
    }

    var ruby_1 = ruby;

    /*
    Language: Go
    Author: Stephan Kountso aka StepLg <steplg@gmail.com>
    Contributors: Evgeny Stepanischev <imbolk@gmail.com>
    Description: Google go language (golang). For info about language
    Website: http://golang.org/
    Category: common, system
    */

    function go(hljs) {
      const GO_KEYWORDS = {
        keyword:
          'break default func interface select case map struct chan else goto package switch ' +
          'const fallthrough if range type continue for import return var go defer ' +
          'bool byte complex64 complex128 float32 float64 int8 int16 int32 int64 string uint8 ' +
          'uint16 uint32 uint64 int uint uintptr rune',
        literal:
           'true false iota nil',
        built_in:
          'append cap close complex copy imag len make new panic print println real recover delete'
      };
      return {
        name: 'Go',
        aliases: ['golang'],
        keywords: GO_KEYWORDS,
        illegal: '</',
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'string',
            variants: [
              hljs.QUOTE_STRING_MODE,
              hljs.APOS_STRING_MODE,
              {
                begin: '`',
                end: '`'
              }
            ]
          },
          {
            className: 'number',
            variants: [
              {
                begin: hljs.C_NUMBER_RE + '[i]',
                relevance: 1
              },
              hljs.C_NUMBER_MODE
            ]
          },
          {
            begin: /:=/ // relevance booster
          },
          {
            className: 'function',
            beginKeywords: 'func',
            end: '\\s*(\\{|$)',
            excludeEnd: true,
            contains: [
              hljs.TITLE_MODE,
              {
                className: 'params',
                begin: /\(/,
                end: /\)/,
                keywords: GO_KEYWORDS,
                illegal: /["']/
              }
            ]
          }
        ]
      };
    }

    var go_1 = go;

    /*
    Language: PHP
    Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
    Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
    Website: https://www.php.net
    Category: common
    */

    /**
     * @param {HLJSApi} hljs
     * @returns {LanguageDetail}
     * */
    function php(hljs) {
      const VARIABLE = {
        className: 'variable',
        begin: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*' +
          // negative look-ahead tries to avoid matching patterns that are not
          // Perl at all like $ident$, @ident@, etc.
          `(?![A-Za-z0-9])(?![$])`
      };
      const PREPROCESSOR = {
        className: 'meta',
        variants: [
          { begin: /<\?php/, relevance: 10 }, // boost for obvious PHP
          { begin: /<\?[=]?/ },
          { begin: /\?>/ } // end php tag
        ]
      };
      const SUBST = {
        className: 'subst',
        variants: [
          { begin: /\$\w+/ },
          { begin: /\{\$/, end: /\}/ }
        ]
      };
      const SINGLE_QUOTED = hljs.inherit(hljs.APOS_STRING_MODE, {
        illegal: null,
      });
      const DOUBLE_QUOTED = hljs.inherit(hljs.QUOTE_STRING_MODE, {
        illegal: null,
        contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
      });
      const HEREDOC = hljs.END_SAME_AS_BEGIN({
        begin: /<<<[ \t]*(\w+)\n/,
        end: /[ \t]*(\w+)\b/,
        contains: hljs.QUOTE_STRING_MODE.contains.concat(SUBST),
      });
      const STRING = {
        className: 'string',
        contains: [hljs.BACKSLASH_ESCAPE, PREPROCESSOR],
        variants: [
          hljs.inherit(SINGLE_QUOTED, {
            begin: "b'", end: "'",
          }),
          hljs.inherit(DOUBLE_QUOTED, {
            begin: 'b"', end: '"',
          }),
          DOUBLE_QUOTED,
          SINGLE_QUOTED,
          HEREDOC
        ]
      };
      const NUMBER = {
        className: 'number',
        variants: [
          { begin: `\\b0b[01]+(?:_[01]+)*\\b` }, // Binary w/ underscore support
          { begin: `\\b0o[0-7]+(?:_[0-7]+)*\\b` }, // Octals w/ underscore support
          { begin: `\\b0x[\\da-f]+(?:_[\\da-f]+)*\\b` }, // Hex w/ underscore support
          // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
          { begin: `(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:e[+-]?\\d+)?` }
        ],
        relevance: 0
      };
      const KEYWORDS = {
        keyword:
        // Magic constants:
        // <https://www.php.net/manual/en/language.constants.predefined.php>
        '__CLASS__ __DIR__ __FILE__ __FUNCTION__ __LINE__ __METHOD__ __NAMESPACE__ __TRAIT__ ' +
        // Function that look like language construct or language construct that look like function:
        // List of keywords that may not require parenthesis
        'die echo exit include include_once print require require_once ' +
        // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
        // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
        // Other keywords:
        // <https://www.php.net/manual/en/reserved.php>
        // <https://www.php.net/manual/en/language.types.type-juggling.php>
        'array abstract and as binary bool boolean break callable case catch class clone const continue declare ' +
        'default do double else elseif empty enddeclare endfor endforeach endif endswitch endwhile enum eval extends ' +
        'final finally float for foreach from global goto if implements instanceof insteadof int integer interface ' +
        'isset iterable list match|0 mixed new object or private protected public real return string switch throw trait ' +
        'try unset use var void while xor yield',
        literal: 'false null true',
        built_in:
        // Standard PHP library:
        // <https://www.php.net/manual/en/book.spl.php>
        'Error|0 ' + // error is too common a name esp since PHP is case in-sensitive
        'AppendIterator ArgumentCountError ArithmeticError ArrayIterator ArrayObject AssertionError BadFunctionCallException BadMethodCallException CachingIterator CallbackFilterIterator CompileError Countable DirectoryIterator DivisionByZeroError DomainException EmptyIterator ErrorException Exception FilesystemIterator FilterIterator GlobIterator InfiniteIterator InvalidArgumentException IteratorIterator LengthException LimitIterator LogicException MultipleIterator NoRewindIterator OutOfBoundsException OutOfRangeException OuterIterator OverflowException ParentIterator ParseError RangeException RecursiveArrayIterator RecursiveCachingIterator RecursiveCallbackFilterIterator RecursiveDirectoryIterator RecursiveFilterIterator RecursiveIterator RecursiveIteratorIterator RecursiveRegexIterator RecursiveTreeIterator RegexIterator RuntimeException SeekableIterator SplDoublyLinkedList SplFileInfo SplFileObject SplFixedArray SplHeap SplMaxHeap SplMinHeap SplObjectStorage SplObserver SplObserver SplPriorityQueue SplQueue SplStack SplSubject SplSubject SplTempFileObject TypeError UnderflowException UnexpectedValueException UnhandledMatchError ' +
        // Reserved interfaces:
        // <https://www.php.net/manual/en/reserved.interfaces.php>
        'ArrayAccess Closure Generator Iterator IteratorAggregate Serializable Stringable Throwable Traversable WeakReference WeakMap ' +
        // Reserved classes:
        // <https://www.php.net/manual/en/reserved.classes.php>
        'Directory __PHP_Incomplete_Class parent php_user_filter self static stdClass'
      };
      return {
        aliases: ['php3', 'php4', 'php5', 'php6', 'php7', 'php8'],
        case_insensitive: true,
        keywords: KEYWORDS,
        contains: [
          hljs.HASH_COMMENT_MODE,
          hljs.COMMENT('//', '$', {contains: [PREPROCESSOR]}),
          hljs.COMMENT(
            '/\\*',
            '\\*/',
            {
              contains: [
                {
                  className: 'doctag',
                  begin: '@[A-Za-z]+'
                }
              ]
            }
          ),
          hljs.COMMENT(
            '__halt_compiler.+?;',
            false,
            {
              endsWithParent: true,
              keywords: '__halt_compiler'
            }
          ),
          PREPROCESSOR,
          {
            className: 'keyword', begin: /\$this\b/
          },
          VARIABLE,
          {
            // swallow composed identifiers to avoid parsing them as keywords
            begin: /(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/
          },
          {
            className: 'function',
            relevance: 0,
            beginKeywords: 'fn function', end: /[;{]/, excludeEnd: true,
            illegal: '[$%\\[]',
            contains: [
              {
                beginKeywords: 'use',
              },
              hljs.UNDERSCORE_TITLE_MODE,
              {
                begin: '=>', // No markup, just a relevance booster
                endsParent: true
              },
              {
                className: 'params',
                begin: '\\(', end: '\\)',
                excludeBegin: true,
                excludeEnd: true,
                keywords: KEYWORDS,
                contains: [
                  'self',
                  VARIABLE,
                  hljs.C_BLOCK_COMMENT_MODE,
                  STRING,
                  NUMBER
                ]
              }
            ]
          },
          {
            className: 'class',
            variants: [
              { beginKeywords: "enum", illegal: /[($"]/ },
              { beginKeywords: "class interface trait", illegal: /[:($"]/ }
            ],
            relevance: 0,
            end: /\{/,
            excludeEnd: true,
            contains: [
              {beginKeywords: 'extends implements'},
              hljs.UNDERSCORE_TITLE_MODE
            ]
          },
          {
            beginKeywords: 'namespace',
            relevance: 0,
            end: ';',
            illegal: /[.']/,
            contains: [hljs.UNDERSCORE_TITLE_MODE]
          },
          {
            beginKeywords: 'use',
            relevance: 0,
            end: ';',
            contains: [hljs.UNDERSCORE_TITLE_MODE]
          },
          STRING,
          NUMBER
        ]
      };
    }

    var php_1 = php;

    core.registerLanguage('javascript', javascript_1);
    core.registerLanguage('node', javascript_1);
    core.registerLanguage('python', python_1);
    core.registerLanguage('curl', bash_1);
    core.registerLanguage('ruby', ruby_1);
    core.registerLanguage('go', go_1);
    core.registerLanguage('php', php_1);

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var showdown = createCommonjsModule(function (module) {
    (function(){
    /**
     * Created by Tivie on 13-07-2015.
     */

    function getDefaultOpts (simple) {

      var defaultOptions = {
        omitExtraWLInCodeBlocks: {
          defaultValue: false,
          describe: 'Omit the default extra whiteline added to code blocks',
          type: 'boolean'
        },
        noHeaderId: {
          defaultValue: false,
          describe: 'Turn on/off generated header id',
          type: 'boolean'
        },
        prefixHeaderId: {
          defaultValue: false,
          describe: 'Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic \'section-\' prefix',
          type: 'string'
        },
        rawPrefixHeaderId: {
          defaultValue: false,
          describe: 'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',
          type: 'boolean'
        },
        ghCompatibleHeaderId: {
          defaultValue: false,
          describe: 'Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)',
          type: 'boolean'
        },
        rawHeaderId: {
          defaultValue: false,
          describe: 'Remove only spaces, \' and " from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids',
          type: 'boolean'
        },
        headerLevelStart: {
          defaultValue: false,
          describe: 'The header blocks level start',
          type: 'integer'
        },
        parseImgDimensions: {
          defaultValue: false,
          describe: 'Turn on/off image dimension parsing',
          type: 'boolean'
        },
        simplifiedAutoLink: {
          defaultValue: false,
          describe: 'Turn on/off GFM autolink style',
          type: 'boolean'
        },
        excludeTrailingPunctuationFromURLs: {
          defaultValue: false,
          describe: 'Excludes trailing punctuation from links generated with autoLinking',
          type: 'boolean'
        },
        literalMidWordUnderscores: {
          defaultValue: false,
          describe: 'Parse midword underscores as literal underscores',
          type: 'boolean'
        },
        literalMidWordAsterisks: {
          defaultValue: false,
          describe: 'Parse midword asterisks as literal asterisks',
          type: 'boolean'
        },
        strikethrough: {
          defaultValue: false,
          describe: 'Turn on/off strikethrough support',
          type: 'boolean'
        },
        tables: {
          defaultValue: false,
          describe: 'Turn on/off tables support',
          type: 'boolean'
        },
        tablesHeaderId: {
          defaultValue: false,
          describe: 'Add an id to table headers',
          type: 'boolean'
        },
        ghCodeBlocks: {
          defaultValue: true,
          describe: 'Turn on/off GFM fenced code blocks support',
          type: 'boolean'
        },
        tasklists: {
          defaultValue: false,
          describe: 'Turn on/off GFM tasklist support',
          type: 'boolean'
        },
        smoothLivePreview: {
          defaultValue: false,
          describe: 'Prevents weird effects in live previews due to incomplete input',
          type: 'boolean'
        },
        smartIndentationFix: {
          defaultValue: false,
          description: 'Tries to smartly fix indentation in es6 strings',
          type: 'boolean'
        },
        disableForced4SpacesIndentedSublists: {
          defaultValue: false,
          description: 'Disables the requirement of indenting nested sublists by 4 spaces',
          type: 'boolean'
        },
        simpleLineBreaks: {
          defaultValue: false,
          description: 'Parses simple line breaks as <br> (GFM Style)',
          type: 'boolean'
        },
        requireSpaceBeforeHeadingText: {
          defaultValue: false,
          description: 'Makes adding a space between `#` and the header text mandatory (GFM Style)',
          type: 'boolean'
        },
        ghMentions: {
          defaultValue: false,
          description: 'Enables github @mentions',
          type: 'boolean'
        },
        ghMentionsLink: {
          defaultValue: 'https://github.com/{u}',
          description: 'Changes the link generated by @mentions. Only applies if ghMentions option is enabled.',
          type: 'string'
        },
        encodeEmails: {
          defaultValue: true,
          description: 'Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities',
          type: 'boolean'
        },
        openLinksInNewWindow: {
          defaultValue: false,
          description: 'Open all links in new windows',
          type: 'boolean'
        },
        backslashEscapesHTMLTags: {
          defaultValue: false,
          description: 'Support for HTML Tag escaping. ex: \<div>foo\</div>',
          type: 'boolean'
        },
        emoji: {
          defaultValue: false,
          description: 'Enable emoji support. Ex: `this is a :smile: emoji`',
          type: 'boolean'
        },
        underline: {
          defaultValue: false,
          description: 'Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`',
          type: 'boolean'
        },
        completeHTMLDocument: {
          defaultValue: false,
          description: 'Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags',
          type: 'boolean'
        },
        metadata: {
          defaultValue: false,
          description: 'Enable support for document metadata (defined at the top of the document between `«««` and `»»»` or between `---` and `---`).',
          type: 'boolean'
        },
        splitAdjacentBlockquotes: {
          defaultValue: false,
          description: 'Split adjacent blockquote blocks',
          type: 'boolean'
        }
      };
      if (simple === false) {
        return JSON.parse(JSON.stringify(defaultOptions));
      }
      var ret = {};
      for (var opt in defaultOptions) {
        if (defaultOptions.hasOwnProperty(opt)) {
          ret[opt] = defaultOptions[opt].defaultValue;
        }
      }
      return ret;
    }

    function allOptionsOn () {
      var options = getDefaultOpts(true),
          ret = {};
      for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
          ret[opt] = true;
        }
      }
      return ret;
    }

    /**
     * Created by Tivie on 06-01-2015.
     */

    // Private properties
    var showdown = {},
        parsers = {},
        extensions = {},
        globalOptions = getDefaultOpts(true),
        setFlavor = 'vanilla',
        flavor = {
          github: {
            omitExtraWLInCodeBlocks:              true,
            simplifiedAutoLink:                   true,
            excludeTrailingPunctuationFromURLs:   true,
            literalMidWordUnderscores:            true,
            strikethrough:                        true,
            tables:                               true,
            tablesHeaderId:                       true,
            ghCodeBlocks:                         true,
            tasklists:                            true,
            disableForced4SpacesIndentedSublists: true,
            simpleLineBreaks:                     true,
            requireSpaceBeforeHeadingText:        true,
            ghCompatibleHeaderId:                 true,
            ghMentions:                           true,
            backslashEscapesHTMLTags:             true,
            emoji:                                true,
            splitAdjacentBlockquotes:             true
          },
          original: {
            noHeaderId:                           true,
            ghCodeBlocks:                         false
          },
          ghost: {
            omitExtraWLInCodeBlocks:              true,
            parseImgDimensions:                   true,
            simplifiedAutoLink:                   true,
            excludeTrailingPunctuationFromURLs:   true,
            literalMidWordUnderscores:            true,
            strikethrough:                        true,
            tables:                               true,
            tablesHeaderId:                       true,
            ghCodeBlocks:                         true,
            tasklists:                            true,
            smoothLivePreview:                    true,
            simpleLineBreaks:                     true,
            requireSpaceBeforeHeadingText:        true,
            ghMentions:                           false,
            encodeEmails:                         true
          },
          vanilla: getDefaultOpts(true),
          allOn: allOptionsOn()
        };

    /**
     * helper namespace
     * @type {{}}
     */
    showdown.helper = {};

    /**
     * TODO LEGACY SUPPORT CODE
     * @type {{}}
     */
    showdown.extensions = {};

    /**
     * Set a global option
     * @static
     * @param {string} key
     * @param {*} value
     * @returns {showdown}
     */
    showdown.setOption = function (key, value) {
      globalOptions[key] = value;
      return this;
    };

    /**
     * Get a global option
     * @static
     * @param {string} key
     * @returns {*}
     */
    showdown.getOption = function (key) {
      return globalOptions[key];
    };

    /**
     * Get the global options
     * @static
     * @returns {{}}
     */
    showdown.getOptions = function () {
      return globalOptions;
    };

    /**
     * Reset global options to the default values
     * @static
     */
    showdown.resetOptions = function () {
      globalOptions = getDefaultOpts(true);
    };

    /**
     * Set the flavor showdown should use as default
     * @param {string} name
     */
    showdown.setFlavor = function (name) {
      if (!flavor.hasOwnProperty(name)) {
        throw Error(name + ' flavor was not found');
      }
      showdown.resetOptions();
      var preset = flavor[name];
      setFlavor = name;
      for (var option in preset) {
        if (preset.hasOwnProperty(option)) {
          globalOptions[option] = preset[option];
        }
      }
    };

    /**
     * Get the currently set flavor
     * @returns {string}
     */
    showdown.getFlavor = function () {
      return setFlavor;
    };

    /**
     * Get the options of a specified flavor. Returns undefined if the flavor was not found
     * @param {string} name Name of the flavor
     * @returns {{}|undefined}
     */
    showdown.getFlavorOptions = function (name) {
      if (flavor.hasOwnProperty(name)) {
        return flavor[name];
      }
    };

    /**
     * Get the default options
     * @static
     * @param {boolean} [simple=true]
     * @returns {{}}
     */
    showdown.getDefaultOptions = function (simple) {
      return getDefaultOpts(simple);
    };

    /**
     * Get or set a subParser
     *
     * subParser(name)       - Get a registered subParser
     * subParser(name, func) - Register a subParser
     * @static
     * @param {string} name
     * @param {function} [func]
     * @returns {*}
     */
    showdown.subParser = function (name, func) {
      if (showdown.helper.isString(name)) {
        if (typeof func !== 'undefined') {
          parsers[name] = func;
        } else {
          if (parsers.hasOwnProperty(name)) {
            return parsers[name];
          } else {
            throw Error('SubParser named ' + name + ' not registered!');
          }
        }
      }
    };

    /**
     * Gets or registers an extension
     * @static
     * @param {string} name
     * @param {object|function=} ext
     * @returns {*}
     */
    showdown.extension = function (name, ext) {

      if (!showdown.helper.isString(name)) {
        throw Error('Extension \'name\' must be a string');
      }

      name = showdown.helper.stdExtName(name);

      // Getter
      if (showdown.helper.isUndefined(ext)) {
        if (!extensions.hasOwnProperty(name)) {
          throw Error('Extension named ' + name + ' is not registered!');
        }
        return extensions[name];

        // Setter
      } else {
        // Expand extension if it's wrapped in a function
        if (typeof ext === 'function') {
          ext = ext();
        }

        // Ensure extension is an array
        if (!showdown.helper.isArray(ext)) {
          ext = [ext];
        }

        var validExtension = validate(ext, name);

        if (validExtension.valid) {
          extensions[name] = ext;
        } else {
          throw Error(validExtension.error);
        }
      }
    };

    /**
     * Gets all extensions registered
     * @returns {{}}
     */
    showdown.getAllExtensions = function () {
      return extensions;
    };

    /**
     * Remove an extension
     * @param {string} name
     */
    showdown.removeExtension = function (name) {
      delete extensions[name];
    };

    /**
     * Removes all extensions
     */
    showdown.resetExtensions = function () {
      extensions = {};
    };

    /**
     * Validate extension
     * @param {array} extension
     * @param {string} name
     * @returns {{valid: boolean, error: string}}
     */
    function validate (extension, name) {

      var errMsg = (name) ? 'Error in ' + name + ' extension->' : 'Error in unnamed extension',
          ret = {
            valid: true,
            error: ''
          };

      if (!showdown.helper.isArray(extension)) {
        extension = [extension];
      }

      for (var i = 0; i < extension.length; ++i) {
        var baseMsg = errMsg + ' sub-extension ' + i + ': ',
            ext = extension[i];
        if (typeof ext !== 'object') {
          ret.valid = false;
          ret.error = baseMsg + 'must be an object, but ' + typeof ext + ' given';
          return ret;
        }

        if (!showdown.helper.isString(ext.type)) {
          ret.valid = false;
          ret.error = baseMsg + 'property "type" must be a string, but ' + typeof ext.type + ' given';
          return ret;
        }

        var type = ext.type = ext.type.toLowerCase();

        // normalize extension type
        if (type === 'language') {
          type = ext.type = 'lang';
        }

        if (type === 'html') {
          type = ext.type = 'output';
        }

        if (type !== 'lang' && type !== 'output' && type !== 'listener') {
          ret.valid = false;
          ret.error = baseMsg + 'type ' + type + ' is not recognized. Valid values: "lang/language", "output/html" or "listener"';
          return ret;
        }

        if (type === 'listener') {
          if (showdown.helper.isUndefined(ext.listeners)) {
            ret.valid = false;
            ret.error = baseMsg + '. Extensions of type "listener" must have a property called "listeners"';
            return ret;
          }
        } else {
          if (showdown.helper.isUndefined(ext.filter) && showdown.helper.isUndefined(ext.regex)) {
            ret.valid = false;
            ret.error = baseMsg + type + ' extensions must define either a "regex" property or a "filter" method';
            return ret;
          }
        }

        if (ext.listeners) {
          if (typeof ext.listeners !== 'object') {
            ret.valid = false;
            ret.error = baseMsg + '"listeners" property must be an object but ' + typeof ext.listeners + ' given';
            return ret;
          }
          for (var ln in ext.listeners) {
            if (ext.listeners.hasOwnProperty(ln)) {
              if (typeof ext.listeners[ln] !== 'function') {
                ret.valid = false;
                ret.error = baseMsg + '"listeners" property must be an hash of [event name]: [callback]. listeners.' + ln +
                  ' must be a function but ' + typeof ext.listeners[ln] + ' given';
                return ret;
              }
            }
          }
        }

        if (ext.filter) {
          if (typeof ext.filter !== 'function') {
            ret.valid = false;
            ret.error = baseMsg + '"filter" must be a function, but ' + typeof ext.filter + ' given';
            return ret;
          }
        } else if (ext.regex) {
          if (showdown.helper.isString(ext.regex)) {
            ext.regex = new RegExp(ext.regex, 'g');
          }
          if (!(ext.regex instanceof RegExp)) {
            ret.valid = false;
            ret.error = baseMsg + '"regex" property must either be a string or a RegExp object, but ' + typeof ext.regex + ' given';
            return ret;
          }
          if (showdown.helper.isUndefined(ext.replace)) {
            ret.valid = false;
            ret.error = baseMsg + '"regex" extensions must implement a replace string or function';
            return ret;
          }
        }
      }
      return ret;
    }

    /**
     * Validate extension
     * @param {object} ext
     * @returns {boolean}
     */
    showdown.validateExtension = function (ext) {

      var validateExtension = validate(ext, null);
      if (!validateExtension.valid) {
        console.warn(validateExtension.error);
        return false;
      }
      return true;
    };

    /**
     * showdownjs helper functions
     */

    if (!showdown.hasOwnProperty('helper')) {
      showdown.helper = {};
    }

    /**
     * Check if var is string
     * @static
     * @param {string} a
     * @returns {boolean}
     */
    showdown.helper.isString = function (a) {
      return (typeof a === 'string' || a instanceof String);
    };

    /**
     * Check if var is a function
     * @static
     * @param {*} a
     * @returns {boolean}
     */
    showdown.helper.isFunction = function (a) {
      var getType = {};
      return a && getType.toString.call(a) === '[object Function]';
    };

    /**
     * isArray helper function
     * @static
     * @param {*} a
     * @returns {boolean}
     */
    showdown.helper.isArray = function (a) {
      return Array.isArray(a);
    };

    /**
     * Check if value is undefined
     * @static
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
     */
    showdown.helper.isUndefined = function (value) {
      return typeof value === 'undefined';
    };

    /**
     * ForEach helper function
     * Iterates over Arrays and Objects (own properties only)
     * @static
     * @param {*} obj
     * @param {function} callback Accepts 3 params: 1. value, 2. key, 3. the original array/object
     */
    showdown.helper.forEach = function (obj, callback) {
      // check if obj is defined
      if (showdown.helper.isUndefined(obj)) {
        throw new Error('obj param is required');
      }

      if (showdown.helper.isUndefined(callback)) {
        throw new Error('callback param is required');
      }

      if (!showdown.helper.isFunction(callback)) {
        throw new Error('callback param must be a function/closure');
      }

      if (typeof obj.forEach === 'function') {
        obj.forEach(callback);
      } else if (showdown.helper.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
          callback(obj[i], i, obj);
        }
      } else if (typeof (obj) === 'object') {
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            callback(obj[prop], prop, obj);
          }
        }
      } else {
        throw new Error('obj does not seem to be an array or an iterable object');
      }
    };

    /**
     * Standardidize extension name
     * @static
     * @param {string} s extension name
     * @returns {string}
     */
    showdown.helper.stdExtName = function (s) {
      return s.replace(/[_?*+\/\\.^-]/g, '').replace(/\s/g, '').toLowerCase();
    };

    function escapeCharactersCallback (wholeMatch, m1) {
      var charCodeToEscape = m1.charCodeAt(0);
      return '¨E' + charCodeToEscape + 'E';
    }

    /**
     * Callback used to escape characters when passing through String.replace
     * @static
     * @param {string} wholeMatch
     * @param {string} m1
     * @returns {string}
     */
    showdown.helper.escapeCharactersCallback = escapeCharactersCallback;

    /**
     * Escape characters in a string
     * @static
     * @param {string} text
     * @param {string} charsToEscape
     * @param {boolean} afterBackslash
     * @returns {XML|string|void|*}
     */
    showdown.helper.escapeCharacters = function (text, charsToEscape, afterBackslash) {
      // First we have to escape the escape characters so that
      // we can build a character class out of them
      var regexString = '([' + charsToEscape.replace(/([\[\]\\])/g, '\\$1') + '])';

      if (afterBackslash) {
        regexString = '\\\\' + regexString;
      }

      var regex = new RegExp(regexString, 'g');
      text = text.replace(regex, escapeCharactersCallback);

      return text;
    };

    /**
     * Unescape HTML entities
     * @param txt
     * @returns {string}
     */
    showdown.helper.unescapeHTMLEntities = function (txt) {

      return txt
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    };

    var rgxFindMatchPos = function (str, left, right, flags) {
      var f = flags || '',
          g = f.indexOf('g') > -1,
          x = new RegExp(left + '|' + right, 'g' + f.replace(/g/g, '')),
          l = new RegExp(left, f.replace(/g/g, '')),
          pos = [],
          t, s, m, start, end;

      do {
        t = 0;
        while ((m = x.exec(str))) {
          if (l.test(m[0])) {
            if (!(t++)) {
              s = x.lastIndex;
              start = s - m[0].length;
            }
          } else if (t) {
            if (!--t) {
              end = m.index + m[0].length;
              var obj = {
                left: {start: start, end: s},
                match: {start: s, end: m.index},
                right: {start: m.index, end: end},
                wholeMatch: {start: start, end: end}
              };
              pos.push(obj);
              if (!g) {
                return pos;
              }
            }
          }
        }
      } while (t && (x.lastIndex = s));

      return pos;
    };

    /**
     * matchRecursiveRegExp
     *
     * (c) 2007 Steven Levithan <stevenlevithan.com>
     * MIT License
     *
     * Accepts a string to search, a left and right format delimiter
     * as regex patterns, and optional regex flags. Returns an array
     * of matches, allowing nested instances of left/right delimiters.
     * Use the "g" flag to return all matches, otherwise only the
     * first is returned. Be careful to ensure that the left and
     * right format delimiters produce mutually exclusive matches.
     * Backreferences are not supported within the right delimiter
     * due to how it is internally combined with the left delimiter.
     * When matching strings whose format delimiters are unbalanced
     * to the left or right, the output is intentionally as a
     * conventional regex library with recursion support would
     * produce, e.g. "<<x>" and "<x>>" both produce ["x"] when using
     * "<" and ">" as the delimiters (both strings contain a single,
     * balanced instance of "<x>").
     *
     * examples:
     * matchRecursiveRegExp("test", "\\(", "\\)")
     * returns: []
     * matchRecursiveRegExp("<t<<e>><s>>t<>", "<", ">", "g")
     * returns: ["t<<e>><s>", ""]
     * matchRecursiveRegExp("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi")
     * returns: ["test"]
     */
    showdown.helper.matchRecursiveRegExp = function (str, left, right, flags) {

      var matchPos = rgxFindMatchPos (str, left, right, flags),
          results = [];

      for (var i = 0; i < matchPos.length; ++i) {
        results.push([
          str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
          str.slice(matchPos[i].match.start, matchPos[i].match.end),
          str.slice(matchPos[i].left.start, matchPos[i].left.end),
          str.slice(matchPos[i].right.start, matchPos[i].right.end)
        ]);
      }
      return results;
    };

    /**
     *
     * @param {string} str
     * @param {string|function} replacement
     * @param {string} left
     * @param {string} right
     * @param {string} flags
     * @returns {string}
     */
    showdown.helper.replaceRecursiveRegExp = function (str, replacement, left, right, flags) {

      if (!showdown.helper.isFunction(replacement)) {
        var repStr = replacement;
        replacement = function () {
          return repStr;
        };
      }

      var matchPos = rgxFindMatchPos(str, left, right, flags),
          finalStr = str,
          lng = matchPos.length;

      if (lng > 0) {
        var bits = [];
        if (matchPos[0].wholeMatch.start !== 0) {
          bits.push(str.slice(0, matchPos[0].wholeMatch.start));
        }
        for (var i = 0; i < lng; ++i) {
          bits.push(
            replacement(
              str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
              str.slice(matchPos[i].match.start, matchPos[i].match.end),
              str.slice(matchPos[i].left.start, matchPos[i].left.end),
              str.slice(matchPos[i].right.start, matchPos[i].right.end)
            )
          );
          if (i < lng - 1) {
            bits.push(str.slice(matchPos[i].wholeMatch.end, matchPos[i + 1].wholeMatch.start));
          }
        }
        if (matchPos[lng - 1].wholeMatch.end < str.length) {
          bits.push(str.slice(matchPos[lng - 1].wholeMatch.end));
        }
        finalStr = bits.join('');
      }
      return finalStr;
    };

    /**
     * Returns the index within the passed String object of the first occurrence of the specified regex,
     * starting the search at fromIndex. Returns -1 if the value is not found.
     *
     * @param {string} str string to search
     * @param {RegExp} regex Regular expression to search
     * @param {int} [fromIndex = 0] Index to start the search
     * @returns {Number}
     * @throws InvalidArgumentError
     */
    showdown.helper.regexIndexOf = function (str, regex, fromIndex) {
      if (!showdown.helper.isString(str)) {
        throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
      }
      if (regex instanceof RegExp === false) {
        throw 'InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp';
      }
      var indexOf = str.substring(fromIndex || 0).search(regex);
      return (indexOf >= 0) ? (indexOf + (fromIndex || 0)) : indexOf;
    };

    /**
     * Splits the passed string object at the defined index, and returns an array composed of the two substrings
     * @param {string} str string to split
     * @param {int} index index to split string at
     * @returns {[string,string]}
     * @throws InvalidArgumentError
     */
    showdown.helper.splitAtIndex = function (str, index) {
      if (!showdown.helper.isString(str)) {
        throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
      }
      return [str.substring(0, index), str.substring(index)];
    };

    /**
     * Obfuscate an e-mail address through the use of Character Entities,
     * transforming ASCII characters into their equivalent decimal or hex entities.
     *
     * Since it has a random component, subsequent calls to this function produce different results
     *
     * @param {string} mail
     * @returns {string}
     */
    showdown.helper.encodeEmailAddress = function (mail) {
      var encode = [
        function (ch) {
          return '&#' + ch.charCodeAt(0) + ';';
        },
        function (ch) {
          return '&#x' + ch.charCodeAt(0).toString(16) + ';';
        },
        function (ch) {
          return ch;
        }
      ];

      mail = mail.replace(/./g, function (ch) {
        if (ch === '@') {
          // this *must* be encoded. I insist.
          ch = encode[Math.floor(Math.random() * 2)](ch);
        } else {
          var r = Math.random();
          // roughly 10% raw, 45% hex, 45% dec
          ch = (
            r > 0.9 ? encode[2](ch) : r > 0.45 ? encode[1](ch) : encode[0](ch)
          );
        }
        return ch;
      });

      return mail;
    };

    /**
     *
     * @param str
     * @param targetLength
     * @param padString
     * @returns {string}
     */
    showdown.helper.padEnd = function padEnd (str, targetLength, padString) {
      /*jshint bitwise: false*/
      // eslint-disable-next-line space-infix-ops
      targetLength = targetLength>>0; //floor if number or convert non-number to 0;
      /*jshint bitwise: true*/
      padString = String(padString || ' ');
      if (str.length > targetLength) {
        return String(str);
      } else {
        targetLength = targetLength - str.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
        }
        return String(str) + padString.slice(0,targetLength);
      }
    };

    /**
     * POLYFILLS
     */
    // use this instead of builtin is undefined for IE8 compatibility
    if (typeof console === 'undefined') {
      console = {
        warn: function (msg) {
          alert(msg);
        },
        log: function (msg) {
          alert(msg);
        },
        error: function (msg) {
          throw msg;
        }
      };
    }

    /**
     * Common regexes.
     * We declare some common regexes to improve performance
     */
    showdown.helper.regexes = {
      asteriskDashAndColon: /([*_:~])/g
    };

    /**
     * EMOJIS LIST
     */
    showdown.helper.emojis = {
      '+1':'\ud83d\udc4d',
      '-1':'\ud83d\udc4e',
      '100':'\ud83d\udcaf',
      '1234':'\ud83d\udd22',
      '1st_place_medal':'\ud83e\udd47',
      '2nd_place_medal':'\ud83e\udd48',
      '3rd_place_medal':'\ud83e\udd49',
      '8ball':'\ud83c\udfb1',
      'a':'\ud83c\udd70\ufe0f',
      'ab':'\ud83c\udd8e',
      'abc':'\ud83d\udd24',
      'abcd':'\ud83d\udd21',
      'accept':'\ud83c\ude51',
      'aerial_tramway':'\ud83d\udea1',
      'airplane':'\u2708\ufe0f',
      'alarm_clock':'\u23f0',
      'alembic':'\u2697\ufe0f',
      'alien':'\ud83d\udc7d',
      'ambulance':'\ud83d\ude91',
      'amphora':'\ud83c\udffa',
      'anchor':'\u2693\ufe0f',
      'angel':'\ud83d\udc7c',
      'anger':'\ud83d\udca2',
      'angry':'\ud83d\ude20',
      'anguished':'\ud83d\ude27',
      'ant':'\ud83d\udc1c',
      'apple':'\ud83c\udf4e',
      'aquarius':'\u2652\ufe0f',
      'aries':'\u2648\ufe0f',
      'arrow_backward':'\u25c0\ufe0f',
      'arrow_double_down':'\u23ec',
      'arrow_double_up':'\u23eb',
      'arrow_down':'\u2b07\ufe0f',
      'arrow_down_small':'\ud83d\udd3d',
      'arrow_forward':'\u25b6\ufe0f',
      'arrow_heading_down':'\u2935\ufe0f',
      'arrow_heading_up':'\u2934\ufe0f',
      'arrow_left':'\u2b05\ufe0f',
      'arrow_lower_left':'\u2199\ufe0f',
      'arrow_lower_right':'\u2198\ufe0f',
      'arrow_right':'\u27a1\ufe0f',
      'arrow_right_hook':'\u21aa\ufe0f',
      'arrow_up':'\u2b06\ufe0f',
      'arrow_up_down':'\u2195\ufe0f',
      'arrow_up_small':'\ud83d\udd3c',
      'arrow_upper_left':'\u2196\ufe0f',
      'arrow_upper_right':'\u2197\ufe0f',
      'arrows_clockwise':'\ud83d\udd03',
      'arrows_counterclockwise':'\ud83d\udd04',
      'art':'\ud83c\udfa8',
      'articulated_lorry':'\ud83d\ude9b',
      'artificial_satellite':'\ud83d\udef0',
      'astonished':'\ud83d\ude32',
      'athletic_shoe':'\ud83d\udc5f',
      'atm':'\ud83c\udfe7',
      'atom_symbol':'\u269b\ufe0f',
      'avocado':'\ud83e\udd51',
      'b':'\ud83c\udd71\ufe0f',
      'baby':'\ud83d\udc76',
      'baby_bottle':'\ud83c\udf7c',
      'baby_chick':'\ud83d\udc24',
      'baby_symbol':'\ud83d\udebc',
      'back':'\ud83d\udd19',
      'bacon':'\ud83e\udd53',
      'badminton':'\ud83c\udff8',
      'baggage_claim':'\ud83d\udec4',
      'baguette_bread':'\ud83e\udd56',
      'balance_scale':'\u2696\ufe0f',
      'balloon':'\ud83c\udf88',
      'ballot_box':'\ud83d\uddf3',
      'ballot_box_with_check':'\u2611\ufe0f',
      'bamboo':'\ud83c\udf8d',
      'banana':'\ud83c\udf4c',
      'bangbang':'\u203c\ufe0f',
      'bank':'\ud83c\udfe6',
      'bar_chart':'\ud83d\udcca',
      'barber':'\ud83d\udc88',
      'baseball':'\u26be\ufe0f',
      'basketball':'\ud83c\udfc0',
      'basketball_man':'\u26f9\ufe0f',
      'basketball_woman':'\u26f9\ufe0f&zwj;\u2640\ufe0f',
      'bat':'\ud83e\udd87',
      'bath':'\ud83d\udec0',
      'bathtub':'\ud83d\udec1',
      'battery':'\ud83d\udd0b',
      'beach_umbrella':'\ud83c\udfd6',
      'bear':'\ud83d\udc3b',
      'bed':'\ud83d\udecf',
      'bee':'\ud83d\udc1d',
      'beer':'\ud83c\udf7a',
      'beers':'\ud83c\udf7b',
      'beetle':'\ud83d\udc1e',
      'beginner':'\ud83d\udd30',
      'bell':'\ud83d\udd14',
      'bellhop_bell':'\ud83d\udece',
      'bento':'\ud83c\udf71',
      'biking_man':'\ud83d\udeb4',
      'bike':'\ud83d\udeb2',
      'biking_woman':'\ud83d\udeb4&zwj;\u2640\ufe0f',
      'bikini':'\ud83d\udc59',
      'biohazard':'\u2623\ufe0f',
      'bird':'\ud83d\udc26',
      'birthday':'\ud83c\udf82',
      'black_circle':'\u26ab\ufe0f',
      'black_flag':'\ud83c\udff4',
      'black_heart':'\ud83d\udda4',
      'black_joker':'\ud83c\udccf',
      'black_large_square':'\u2b1b\ufe0f',
      'black_medium_small_square':'\u25fe\ufe0f',
      'black_medium_square':'\u25fc\ufe0f',
      'black_nib':'\u2712\ufe0f',
      'black_small_square':'\u25aa\ufe0f',
      'black_square_button':'\ud83d\udd32',
      'blonde_man':'\ud83d\udc71',
      'blonde_woman':'\ud83d\udc71&zwj;\u2640\ufe0f',
      'blossom':'\ud83c\udf3c',
      'blowfish':'\ud83d\udc21',
      'blue_book':'\ud83d\udcd8',
      'blue_car':'\ud83d\ude99',
      'blue_heart':'\ud83d\udc99',
      'blush':'\ud83d\ude0a',
      'boar':'\ud83d\udc17',
      'boat':'\u26f5\ufe0f',
      'bomb':'\ud83d\udca3',
      'book':'\ud83d\udcd6',
      'bookmark':'\ud83d\udd16',
      'bookmark_tabs':'\ud83d\udcd1',
      'books':'\ud83d\udcda',
      'boom':'\ud83d\udca5',
      'boot':'\ud83d\udc62',
      'bouquet':'\ud83d\udc90',
      'bowing_man':'\ud83d\ude47',
      'bow_and_arrow':'\ud83c\udff9',
      'bowing_woman':'\ud83d\ude47&zwj;\u2640\ufe0f',
      'bowling':'\ud83c\udfb3',
      'boxing_glove':'\ud83e\udd4a',
      'boy':'\ud83d\udc66',
      'bread':'\ud83c\udf5e',
      'bride_with_veil':'\ud83d\udc70',
      'bridge_at_night':'\ud83c\udf09',
      'briefcase':'\ud83d\udcbc',
      'broken_heart':'\ud83d\udc94',
      'bug':'\ud83d\udc1b',
      'building_construction':'\ud83c\udfd7',
      'bulb':'\ud83d\udca1',
      'bullettrain_front':'\ud83d\ude85',
      'bullettrain_side':'\ud83d\ude84',
      'burrito':'\ud83c\udf2f',
      'bus':'\ud83d\ude8c',
      'business_suit_levitating':'\ud83d\udd74',
      'busstop':'\ud83d\ude8f',
      'bust_in_silhouette':'\ud83d\udc64',
      'busts_in_silhouette':'\ud83d\udc65',
      'butterfly':'\ud83e\udd8b',
      'cactus':'\ud83c\udf35',
      'cake':'\ud83c\udf70',
      'calendar':'\ud83d\udcc6',
      'call_me_hand':'\ud83e\udd19',
      'calling':'\ud83d\udcf2',
      'camel':'\ud83d\udc2b',
      'camera':'\ud83d\udcf7',
      'camera_flash':'\ud83d\udcf8',
      'camping':'\ud83c\udfd5',
      'cancer':'\u264b\ufe0f',
      'candle':'\ud83d\udd6f',
      'candy':'\ud83c\udf6c',
      'canoe':'\ud83d\udef6',
      'capital_abcd':'\ud83d\udd20',
      'capricorn':'\u2651\ufe0f',
      'car':'\ud83d\ude97',
      'card_file_box':'\ud83d\uddc3',
      'card_index':'\ud83d\udcc7',
      'card_index_dividers':'\ud83d\uddc2',
      'carousel_horse':'\ud83c\udfa0',
      'carrot':'\ud83e\udd55',
      'cat':'\ud83d\udc31',
      'cat2':'\ud83d\udc08',
      'cd':'\ud83d\udcbf',
      'chains':'\u26d3',
      'champagne':'\ud83c\udf7e',
      'chart':'\ud83d\udcb9',
      'chart_with_downwards_trend':'\ud83d\udcc9',
      'chart_with_upwards_trend':'\ud83d\udcc8',
      'checkered_flag':'\ud83c\udfc1',
      'cheese':'\ud83e\uddc0',
      'cherries':'\ud83c\udf52',
      'cherry_blossom':'\ud83c\udf38',
      'chestnut':'\ud83c\udf30',
      'chicken':'\ud83d\udc14',
      'children_crossing':'\ud83d\udeb8',
      'chipmunk':'\ud83d\udc3f',
      'chocolate_bar':'\ud83c\udf6b',
      'christmas_tree':'\ud83c\udf84',
      'church':'\u26ea\ufe0f',
      'cinema':'\ud83c\udfa6',
      'circus_tent':'\ud83c\udfaa',
      'city_sunrise':'\ud83c\udf07',
      'city_sunset':'\ud83c\udf06',
      'cityscape':'\ud83c\udfd9',
      'cl':'\ud83c\udd91',
      'clamp':'\ud83d\udddc',
      'clap':'\ud83d\udc4f',
      'clapper':'\ud83c\udfac',
      'classical_building':'\ud83c\udfdb',
      'clinking_glasses':'\ud83e\udd42',
      'clipboard':'\ud83d\udccb',
      'clock1':'\ud83d\udd50',
      'clock10':'\ud83d\udd59',
      'clock1030':'\ud83d\udd65',
      'clock11':'\ud83d\udd5a',
      'clock1130':'\ud83d\udd66',
      'clock12':'\ud83d\udd5b',
      'clock1230':'\ud83d\udd67',
      'clock130':'\ud83d\udd5c',
      'clock2':'\ud83d\udd51',
      'clock230':'\ud83d\udd5d',
      'clock3':'\ud83d\udd52',
      'clock330':'\ud83d\udd5e',
      'clock4':'\ud83d\udd53',
      'clock430':'\ud83d\udd5f',
      'clock5':'\ud83d\udd54',
      'clock530':'\ud83d\udd60',
      'clock6':'\ud83d\udd55',
      'clock630':'\ud83d\udd61',
      'clock7':'\ud83d\udd56',
      'clock730':'\ud83d\udd62',
      'clock8':'\ud83d\udd57',
      'clock830':'\ud83d\udd63',
      'clock9':'\ud83d\udd58',
      'clock930':'\ud83d\udd64',
      'closed_book':'\ud83d\udcd5',
      'closed_lock_with_key':'\ud83d\udd10',
      'closed_umbrella':'\ud83c\udf02',
      'cloud':'\u2601\ufe0f',
      'cloud_with_lightning':'\ud83c\udf29',
      'cloud_with_lightning_and_rain':'\u26c8',
      'cloud_with_rain':'\ud83c\udf27',
      'cloud_with_snow':'\ud83c\udf28',
      'clown_face':'\ud83e\udd21',
      'clubs':'\u2663\ufe0f',
      'cocktail':'\ud83c\udf78',
      'coffee':'\u2615\ufe0f',
      'coffin':'\u26b0\ufe0f',
      'cold_sweat':'\ud83d\ude30',
      'comet':'\u2604\ufe0f',
      'computer':'\ud83d\udcbb',
      'computer_mouse':'\ud83d\uddb1',
      'confetti_ball':'\ud83c\udf8a',
      'confounded':'\ud83d\ude16',
      'confused':'\ud83d\ude15',
      'congratulations':'\u3297\ufe0f',
      'construction':'\ud83d\udea7',
      'construction_worker_man':'\ud83d\udc77',
      'construction_worker_woman':'\ud83d\udc77&zwj;\u2640\ufe0f',
      'control_knobs':'\ud83c\udf9b',
      'convenience_store':'\ud83c\udfea',
      'cookie':'\ud83c\udf6a',
      'cool':'\ud83c\udd92',
      'policeman':'\ud83d\udc6e',
      'copyright':'\u00a9\ufe0f',
      'corn':'\ud83c\udf3d',
      'couch_and_lamp':'\ud83d\udecb',
      'couple':'\ud83d\udc6b',
      'couple_with_heart_woman_man':'\ud83d\udc91',
      'couple_with_heart_man_man':'\ud83d\udc68&zwj;\u2764\ufe0f&zwj;\ud83d\udc68',
      'couple_with_heart_woman_woman':'\ud83d\udc69&zwj;\u2764\ufe0f&zwj;\ud83d\udc69',
      'couplekiss_man_man':'\ud83d\udc68&zwj;\u2764\ufe0f&zwj;\ud83d\udc8b&zwj;\ud83d\udc68',
      'couplekiss_man_woman':'\ud83d\udc8f',
      'couplekiss_woman_woman':'\ud83d\udc69&zwj;\u2764\ufe0f&zwj;\ud83d\udc8b&zwj;\ud83d\udc69',
      'cow':'\ud83d\udc2e',
      'cow2':'\ud83d\udc04',
      'cowboy_hat_face':'\ud83e\udd20',
      'crab':'\ud83e\udd80',
      'crayon':'\ud83d\udd8d',
      'credit_card':'\ud83d\udcb3',
      'crescent_moon':'\ud83c\udf19',
      'cricket':'\ud83c\udfcf',
      'crocodile':'\ud83d\udc0a',
      'croissant':'\ud83e\udd50',
      'crossed_fingers':'\ud83e\udd1e',
      'crossed_flags':'\ud83c\udf8c',
      'crossed_swords':'\u2694\ufe0f',
      'crown':'\ud83d\udc51',
      'cry':'\ud83d\ude22',
      'crying_cat_face':'\ud83d\ude3f',
      'crystal_ball':'\ud83d\udd2e',
      'cucumber':'\ud83e\udd52',
      'cupid':'\ud83d\udc98',
      'curly_loop':'\u27b0',
      'currency_exchange':'\ud83d\udcb1',
      'curry':'\ud83c\udf5b',
      'custard':'\ud83c\udf6e',
      'customs':'\ud83d\udec3',
      'cyclone':'\ud83c\udf00',
      'dagger':'\ud83d\udde1',
      'dancer':'\ud83d\udc83',
      'dancing_women':'\ud83d\udc6f',
      'dancing_men':'\ud83d\udc6f&zwj;\u2642\ufe0f',
      'dango':'\ud83c\udf61',
      'dark_sunglasses':'\ud83d\udd76',
      'dart':'\ud83c\udfaf',
      'dash':'\ud83d\udca8',
      'date':'\ud83d\udcc5',
      'deciduous_tree':'\ud83c\udf33',
      'deer':'\ud83e\udd8c',
      'department_store':'\ud83c\udfec',
      'derelict_house':'\ud83c\udfda',
      'desert':'\ud83c\udfdc',
      'desert_island':'\ud83c\udfdd',
      'desktop_computer':'\ud83d\udda5',
      'male_detective':'\ud83d\udd75\ufe0f',
      'diamond_shape_with_a_dot_inside':'\ud83d\udca0',
      'diamonds':'\u2666\ufe0f',
      'disappointed':'\ud83d\ude1e',
      'disappointed_relieved':'\ud83d\ude25',
      'dizzy':'\ud83d\udcab',
      'dizzy_face':'\ud83d\ude35',
      'do_not_litter':'\ud83d\udeaf',
      'dog':'\ud83d\udc36',
      'dog2':'\ud83d\udc15',
      'dollar':'\ud83d\udcb5',
      'dolls':'\ud83c\udf8e',
      'dolphin':'\ud83d\udc2c',
      'door':'\ud83d\udeaa',
      'doughnut':'\ud83c\udf69',
      'dove':'\ud83d\udd4a',
      'dragon':'\ud83d\udc09',
      'dragon_face':'\ud83d\udc32',
      'dress':'\ud83d\udc57',
      'dromedary_camel':'\ud83d\udc2a',
      'drooling_face':'\ud83e\udd24',
      'droplet':'\ud83d\udca7',
      'drum':'\ud83e\udd41',
      'duck':'\ud83e\udd86',
      'dvd':'\ud83d\udcc0',
      'e-mail':'\ud83d\udce7',
      'eagle':'\ud83e\udd85',
      'ear':'\ud83d\udc42',
      'ear_of_rice':'\ud83c\udf3e',
      'earth_africa':'\ud83c\udf0d',
      'earth_americas':'\ud83c\udf0e',
      'earth_asia':'\ud83c\udf0f',
      'egg':'\ud83e\udd5a',
      'eggplant':'\ud83c\udf46',
      'eight_pointed_black_star':'\u2734\ufe0f',
      'eight_spoked_asterisk':'\u2733\ufe0f',
      'electric_plug':'\ud83d\udd0c',
      'elephant':'\ud83d\udc18',
      'email':'\u2709\ufe0f',
      'end':'\ud83d\udd1a',
      'envelope_with_arrow':'\ud83d\udce9',
      'euro':'\ud83d\udcb6',
      'european_castle':'\ud83c\udff0',
      'european_post_office':'\ud83c\udfe4',
      'evergreen_tree':'\ud83c\udf32',
      'exclamation':'\u2757\ufe0f',
      'expressionless':'\ud83d\ude11',
      'eye':'\ud83d\udc41',
      'eye_speech_bubble':'\ud83d\udc41&zwj;\ud83d\udde8',
      'eyeglasses':'\ud83d\udc53',
      'eyes':'\ud83d\udc40',
      'face_with_head_bandage':'\ud83e\udd15',
      'face_with_thermometer':'\ud83e\udd12',
      'fist_oncoming':'\ud83d\udc4a',
      'factory':'\ud83c\udfed',
      'fallen_leaf':'\ud83c\udf42',
      'family_man_woman_boy':'\ud83d\udc6a',
      'family_man_boy':'\ud83d\udc68&zwj;\ud83d\udc66',
      'family_man_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_man_girl':'\ud83d\udc68&zwj;\ud83d\udc67',
      'family_man_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_man_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'family_man_man_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc66',
      'family_man_man_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_man_man_girl':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67',
      'family_man_man_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_man_man_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'family_man_woman_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_man_woman_girl':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67',
      'family_man_woman_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_man_woman_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'family_woman_boy':'\ud83d\udc69&zwj;\ud83d\udc66',
      'family_woman_boy_boy':'\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_woman_girl':'\ud83d\udc69&zwj;\ud83d\udc67',
      'family_woman_girl_boy':'\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_woman_girl_girl':'\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'family_woman_woman_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc66',
      'family_woman_woman_boy_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
      'family_woman_woman_girl':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67',
      'family_woman_woman_girl_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
      'family_woman_woman_girl_girl':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
      'fast_forward':'\u23e9',
      'fax':'\ud83d\udce0',
      'fearful':'\ud83d\ude28',
      'feet':'\ud83d\udc3e',
      'female_detective':'\ud83d\udd75\ufe0f&zwj;\u2640\ufe0f',
      'ferris_wheel':'\ud83c\udfa1',
      'ferry':'\u26f4',
      'field_hockey':'\ud83c\udfd1',
      'file_cabinet':'\ud83d\uddc4',
      'file_folder':'\ud83d\udcc1',
      'film_projector':'\ud83d\udcfd',
      'film_strip':'\ud83c\udf9e',
      'fire':'\ud83d\udd25',
      'fire_engine':'\ud83d\ude92',
      'fireworks':'\ud83c\udf86',
      'first_quarter_moon':'\ud83c\udf13',
      'first_quarter_moon_with_face':'\ud83c\udf1b',
      'fish':'\ud83d\udc1f',
      'fish_cake':'\ud83c\udf65',
      'fishing_pole_and_fish':'\ud83c\udfa3',
      'fist_raised':'\u270a',
      'fist_left':'\ud83e\udd1b',
      'fist_right':'\ud83e\udd1c',
      'flags':'\ud83c\udf8f',
      'flashlight':'\ud83d\udd26',
      'fleur_de_lis':'\u269c\ufe0f',
      'flight_arrival':'\ud83d\udeec',
      'flight_departure':'\ud83d\udeeb',
      'floppy_disk':'\ud83d\udcbe',
      'flower_playing_cards':'\ud83c\udfb4',
      'flushed':'\ud83d\ude33',
      'fog':'\ud83c\udf2b',
      'foggy':'\ud83c\udf01',
      'football':'\ud83c\udfc8',
      'footprints':'\ud83d\udc63',
      'fork_and_knife':'\ud83c\udf74',
      'fountain':'\u26f2\ufe0f',
      'fountain_pen':'\ud83d\udd8b',
      'four_leaf_clover':'\ud83c\udf40',
      'fox_face':'\ud83e\udd8a',
      'framed_picture':'\ud83d\uddbc',
      'free':'\ud83c\udd93',
      'fried_egg':'\ud83c\udf73',
      'fried_shrimp':'\ud83c\udf64',
      'fries':'\ud83c\udf5f',
      'frog':'\ud83d\udc38',
      'frowning':'\ud83d\ude26',
      'frowning_face':'\u2639\ufe0f',
      'frowning_man':'\ud83d\ude4d&zwj;\u2642\ufe0f',
      'frowning_woman':'\ud83d\ude4d',
      'middle_finger':'\ud83d\udd95',
      'fuelpump':'\u26fd\ufe0f',
      'full_moon':'\ud83c\udf15',
      'full_moon_with_face':'\ud83c\udf1d',
      'funeral_urn':'\u26b1\ufe0f',
      'game_die':'\ud83c\udfb2',
      'gear':'\u2699\ufe0f',
      'gem':'\ud83d\udc8e',
      'gemini':'\u264a\ufe0f',
      'ghost':'\ud83d\udc7b',
      'gift':'\ud83c\udf81',
      'gift_heart':'\ud83d\udc9d',
      'girl':'\ud83d\udc67',
      'globe_with_meridians':'\ud83c\udf10',
      'goal_net':'\ud83e\udd45',
      'goat':'\ud83d\udc10',
      'golf':'\u26f3\ufe0f',
      'golfing_man':'\ud83c\udfcc\ufe0f',
      'golfing_woman':'\ud83c\udfcc\ufe0f&zwj;\u2640\ufe0f',
      'gorilla':'\ud83e\udd8d',
      'grapes':'\ud83c\udf47',
      'green_apple':'\ud83c\udf4f',
      'green_book':'\ud83d\udcd7',
      'green_heart':'\ud83d\udc9a',
      'green_salad':'\ud83e\udd57',
      'grey_exclamation':'\u2755',
      'grey_question':'\u2754',
      'grimacing':'\ud83d\ude2c',
      'grin':'\ud83d\ude01',
      'grinning':'\ud83d\ude00',
      'guardsman':'\ud83d\udc82',
      'guardswoman':'\ud83d\udc82&zwj;\u2640\ufe0f',
      'guitar':'\ud83c\udfb8',
      'gun':'\ud83d\udd2b',
      'haircut_woman':'\ud83d\udc87',
      'haircut_man':'\ud83d\udc87&zwj;\u2642\ufe0f',
      'hamburger':'\ud83c\udf54',
      'hammer':'\ud83d\udd28',
      'hammer_and_pick':'\u2692',
      'hammer_and_wrench':'\ud83d\udee0',
      'hamster':'\ud83d\udc39',
      'hand':'\u270b',
      'handbag':'\ud83d\udc5c',
      'handshake':'\ud83e\udd1d',
      'hankey':'\ud83d\udca9',
      'hatched_chick':'\ud83d\udc25',
      'hatching_chick':'\ud83d\udc23',
      'headphones':'\ud83c\udfa7',
      'hear_no_evil':'\ud83d\ude49',
      'heart':'\u2764\ufe0f',
      'heart_decoration':'\ud83d\udc9f',
      'heart_eyes':'\ud83d\ude0d',
      'heart_eyes_cat':'\ud83d\ude3b',
      'heartbeat':'\ud83d\udc93',
      'heartpulse':'\ud83d\udc97',
      'hearts':'\u2665\ufe0f',
      'heavy_check_mark':'\u2714\ufe0f',
      'heavy_division_sign':'\u2797',
      'heavy_dollar_sign':'\ud83d\udcb2',
      'heavy_heart_exclamation':'\u2763\ufe0f',
      'heavy_minus_sign':'\u2796',
      'heavy_multiplication_x':'\u2716\ufe0f',
      'heavy_plus_sign':'\u2795',
      'helicopter':'\ud83d\ude81',
      'herb':'\ud83c\udf3f',
      'hibiscus':'\ud83c\udf3a',
      'high_brightness':'\ud83d\udd06',
      'high_heel':'\ud83d\udc60',
      'hocho':'\ud83d\udd2a',
      'hole':'\ud83d\udd73',
      'honey_pot':'\ud83c\udf6f',
      'horse':'\ud83d\udc34',
      'horse_racing':'\ud83c\udfc7',
      'hospital':'\ud83c\udfe5',
      'hot_pepper':'\ud83c\udf36',
      'hotdog':'\ud83c\udf2d',
      'hotel':'\ud83c\udfe8',
      'hotsprings':'\u2668\ufe0f',
      'hourglass':'\u231b\ufe0f',
      'hourglass_flowing_sand':'\u23f3',
      'house':'\ud83c\udfe0',
      'house_with_garden':'\ud83c\udfe1',
      'houses':'\ud83c\udfd8',
      'hugs':'\ud83e\udd17',
      'hushed':'\ud83d\ude2f',
      'ice_cream':'\ud83c\udf68',
      'ice_hockey':'\ud83c\udfd2',
      'ice_skate':'\u26f8',
      'icecream':'\ud83c\udf66',
      'id':'\ud83c\udd94',
      'ideograph_advantage':'\ud83c\ude50',
      'imp':'\ud83d\udc7f',
      'inbox_tray':'\ud83d\udce5',
      'incoming_envelope':'\ud83d\udce8',
      'tipping_hand_woman':'\ud83d\udc81',
      'information_source':'\u2139\ufe0f',
      'innocent':'\ud83d\ude07',
      'interrobang':'\u2049\ufe0f',
      'iphone':'\ud83d\udcf1',
      'izakaya_lantern':'\ud83c\udfee',
      'jack_o_lantern':'\ud83c\udf83',
      'japan':'\ud83d\uddfe',
      'japanese_castle':'\ud83c\udfef',
      'japanese_goblin':'\ud83d\udc7a',
      'japanese_ogre':'\ud83d\udc79',
      'jeans':'\ud83d\udc56',
      'joy':'\ud83d\ude02',
      'joy_cat':'\ud83d\ude39',
      'joystick':'\ud83d\udd79',
      'kaaba':'\ud83d\udd4b',
      'key':'\ud83d\udd11',
      'keyboard':'\u2328\ufe0f',
      'keycap_ten':'\ud83d\udd1f',
      'kick_scooter':'\ud83d\udef4',
      'kimono':'\ud83d\udc58',
      'kiss':'\ud83d\udc8b',
      'kissing':'\ud83d\ude17',
      'kissing_cat':'\ud83d\ude3d',
      'kissing_closed_eyes':'\ud83d\ude1a',
      'kissing_heart':'\ud83d\ude18',
      'kissing_smiling_eyes':'\ud83d\ude19',
      'kiwi_fruit':'\ud83e\udd5d',
      'koala':'\ud83d\udc28',
      'koko':'\ud83c\ude01',
      'label':'\ud83c\udff7',
      'large_blue_circle':'\ud83d\udd35',
      'large_blue_diamond':'\ud83d\udd37',
      'large_orange_diamond':'\ud83d\udd36',
      'last_quarter_moon':'\ud83c\udf17',
      'last_quarter_moon_with_face':'\ud83c\udf1c',
      'latin_cross':'\u271d\ufe0f',
      'laughing':'\ud83d\ude06',
      'leaves':'\ud83c\udf43',
      'ledger':'\ud83d\udcd2',
      'left_luggage':'\ud83d\udec5',
      'left_right_arrow':'\u2194\ufe0f',
      'leftwards_arrow_with_hook':'\u21a9\ufe0f',
      'lemon':'\ud83c\udf4b',
      'leo':'\u264c\ufe0f',
      'leopard':'\ud83d\udc06',
      'level_slider':'\ud83c\udf9a',
      'libra':'\u264e\ufe0f',
      'light_rail':'\ud83d\ude88',
      'link':'\ud83d\udd17',
      'lion':'\ud83e\udd81',
      'lips':'\ud83d\udc44',
      'lipstick':'\ud83d\udc84',
      'lizard':'\ud83e\udd8e',
      'lock':'\ud83d\udd12',
      'lock_with_ink_pen':'\ud83d\udd0f',
      'lollipop':'\ud83c\udf6d',
      'loop':'\u27bf',
      'loud_sound':'\ud83d\udd0a',
      'loudspeaker':'\ud83d\udce2',
      'love_hotel':'\ud83c\udfe9',
      'love_letter':'\ud83d\udc8c',
      'low_brightness':'\ud83d\udd05',
      'lying_face':'\ud83e\udd25',
      'm':'\u24c2\ufe0f',
      'mag':'\ud83d\udd0d',
      'mag_right':'\ud83d\udd0e',
      'mahjong':'\ud83c\udc04\ufe0f',
      'mailbox':'\ud83d\udceb',
      'mailbox_closed':'\ud83d\udcea',
      'mailbox_with_mail':'\ud83d\udcec',
      'mailbox_with_no_mail':'\ud83d\udced',
      'man':'\ud83d\udc68',
      'man_artist':'\ud83d\udc68&zwj;\ud83c\udfa8',
      'man_astronaut':'\ud83d\udc68&zwj;\ud83d\ude80',
      'man_cartwheeling':'\ud83e\udd38&zwj;\u2642\ufe0f',
      'man_cook':'\ud83d\udc68&zwj;\ud83c\udf73',
      'man_dancing':'\ud83d\udd7a',
      'man_facepalming':'\ud83e\udd26&zwj;\u2642\ufe0f',
      'man_factory_worker':'\ud83d\udc68&zwj;\ud83c\udfed',
      'man_farmer':'\ud83d\udc68&zwj;\ud83c\udf3e',
      'man_firefighter':'\ud83d\udc68&zwj;\ud83d\ude92',
      'man_health_worker':'\ud83d\udc68&zwj;\u2695\ufe0f',
      'man_in_tuxedo':'\ud83e\udd35',
      'man_judge':'\ud83d\udc68&zwj;\u2696\ufe0f',
      'man_juggling':'\ud83e\udd39&zwj;\u2642\ufe0f',
      'man_mechanic':'\ud83d\udc68&zwj;\ud83d\udd27',
      'man_office_worker':'\ud83d\udc68&zwj;\ud83d\udcbc',
      'man_pilot':'\ud83d\udc68&zwj;\u2708\ufe0f',
      'man_playing_handball':'\ud83e\udd3e&zwj;\u2642\ufe0f',
      'man_playing_water_polo':'\ud83e\udd3d&zwj;\u2642\ufe0f',
      'man_scientist':'\ud83d\udc68&zwj;\ud83d\udd2c',
      'man_shrugging':'\ud83e\udd37&zwj;\u2642\ufe0f',
      'man_singer':'\ud83d\udc68&zwj;\ud83c\udfa4',
      'man_student':'\ud83d\udc68&zwj;\ud83c\udf93',
      'man_teacher':'\ud83d\udc68&zwj;\ud83c\udfeb',
      'man_technologist':'\ud83d\udc68&zwj;\ud83d\udcbb',
      'man_with_gua_pi_mao':'\ud83d\udc72',
      'man_with_turban':'\ud83d\udc73',
      'tangerine':'\ud83c\udf4a',
      'mans_shoe':'\ud83d\udc5e',
      'mantelpiece_clock':'\ud83d\udd70',
      'maple_leaf':'\ud83c\udf41',
      'martial_arts_uniform':'\ud83e\udd4b',
      'mask':'\ud83d\ude37',
      'massage_woman':'\ud83d\udc86',
      'massage_man':'\ud83d\udc86&zwj;\u2642\ufe0f',
      'meat_on_bone':'\ud83c\udf56',
      'medal_military':'\ud83c\udf96',
      'medal_sports':'\ud83c\udfc5',
      'mega':'\ud83d\udce3',
      'melon':'\ud83c\udf48',
      'memo':'\ud83d\udcdd',
      'men_wrestling':'\ud83e\udd3c&zwj;\u2642\ufe0f',
      'menorah':'\ud83d\udd4e',
      'mens':'\ud83d\udeb9',
      'metal':'\ud83e\udd18',
      'metro':'\ud83d\ude87',
      'microphone':'\ud83c\udfa4',
      'microscope':'\ud83d\udd2c',
      'milk_glass':'\ud83e\udd5b',
      'milky_way':'\ud83c\udf0c',
      'minibus':'\ud83d\ude90',
      'minidisc':'\ud83d\udcbd',
      'mobile_phone_off':'\ud83d\udcf4',
      'money_mouth_face':'\ud83e\udd11',
      'money_with_wings':'\ud83d\udcb8',
      'moneybag':'\ud83d\udcb0',
      'monkey':'\ud83d\udc12',
      'monkey_face':'\ud83d\udc35',
      'monorail':'\ud83d\ude9d',
      'moon':'\ud83c\udf14',
      'mortar_board':'\ud83c\udf93',
      'mosque':'\ud83d\udd4c',
      'motor_boat':'\ud83d\udee5',
      'motor_scooter':'\ud83d\udef5',
      'motorcycle':'\ud83c\udfcd',
      'motorway':'\ud83d\udee3',
      'mount_fuji':'\ud83d\uddfb',
      'mountain':'\u26f0',
      'mountain_biking_man':'\ud83d\udeb5',
      'mountain_biking_woman':'\ud83d\udeb5&zwj;\u2640\ufe0f',
      'mountain_cableway':'\ud83d\udea0',
      'mountain_railway':'\ud83d\ude9e',
      'mountain_snow':'\ud83c\udfd4',
      'mouse':'\ud83d\udc2d',
      'mouse2':'\ud83d\udc01',
      'movie_camera':'\ud83c\udfa5',
      'moyai':'\ud83d\uddff',
      'mrs_claus':'\ud83e\udd36',
      'muscle':'\ud83d\udcaa',
      'mushroom':'\ud83c\udf44',
      'musical_keyboard':'\ud83c\udfb9',
      'musical_note':'\ud83c\udfb5',
      'musical_score':'\ud83c\udfbc',
      'mute':'\ud83d\udd07',
      'nail_care':'\ud83d\udc85',
      'name_badge':'\ud83d\udcdb',
      'national_park':'\ud83c\udfde',
      'nauseated_face':'\ud83e\udd22',
      'necktie':'\ud83d\udc54',
      'negative_squared_cross_mark':'\u274e',
      'nerd_face':'\ud83e\udd13',
      'neutral_face':'\ud83d\ude10',
      'new':'\ud83c\udd95',
      'new_moon':'\ud83c\udf11',
      'new_moon_with_face':'\ud83c\udf1a',
      'newspaper':'\ud83d\udcf0',
      'newspaper_roll':'\ud83d\uddde',
      'next_track_button':'\u23ed',
      'ng':'\ud83c\udd96',
      'no_good_man':'\ud83d\ude45&zwj;\u2642\ufe0f',
      'no_good_woman':'\ud83d\ude45',
      'night_with_stars':'\ud83c\udf03',
      'no_bell':'\ud83d\udd15',
      'no_bicycles':'\ud83d\udeb3',
      'no_entry':'\u26d4\ufe0f',
      'no_entry_sign':'\ud83d\udeab',
      'no_mobile_phones':'\ud83d\udcf5',
      'no_mouth':'\ud83d\ude36',
      'no_pedestrians':'\ud83d\udeb7',
      'no_smoking':'\ud83d\udead',
      'non-potable_water':'\ud83d\udeb1',
      'nose':'\ud83d\udc43',
      'notebook':'\ud83d\udcd3',
      'notebook_with_decorative_cover':'\ud83d\udcd4',
      'notes':'\ud83c\udfb6',
      'nut_and_bolt':'\ud83d\udd29',
      'o':'\u2b55\ufe0f',
      'o2':'\ud83c\udd7e\ufe0f',
      'ocean':'\ud83c\udf0a',
      'octopus':'\ud83d\udc19',
      'oden':'\ud83c\udf62',
      'office':'\ud83c\udfe2',
      'oil_drum':'\ud83d\udee2',
      'ok':'\ud83c\udd97',
      'ok_hand':'\ud83d\udc4c',
      'ok_man':'\ud83d\ude46&zwj;\u2642\ufe0f',
      'ok_woman':'\ud83d\ude46',
      'old_key':'\ud83d\udddd',
      'older_man':'\ud83d\udc74',
      'older_woman':'\ud83d\udc75',
      'om':'\ud83d\udd49',
      'on':'\ud83d\udd1b',
      'oncoming_automobile':'\ud83d\ude98',
      'oncoming_bus':'\ud83d\ude8d',
      'oncoming_police_car':'\ud83d\ude94',
      'oncoming_taxi':'\ud83d\ude96',
      'open_file_folder':'\ud83d\udcc2',
      'open_hands':'\ud83d\udc50',
      'open_mouth':'\ud83d\ude2e',
      'open_umbrella':'\u2602\ufe0f',
      'ophiuchus':'\u26ce',
      'orange_book':'\ud83d\udcd9',
      'orthodox_cross':'\u2626\ufe0f',
      'outbox_tray':'\ud83d\udce4',
      'owl':'\ud83e\udd89',
      'ox':'\ud83d\udc02',
      'package':'\ud83d\udce6',
      'page_facing_up':'\ud83d\udcc4',
      'page_with_curl':'\ud83d\udcc3',
      'pager':'\ud83d\udcdf',
      'paintbrush':'\ud83d\udd8c',
      'palm_tree':'\ud83c\udf34',
      'pancakes':'\ud83e\udd5e',
      'panda_face':'\ud83d\udc3c',
      'paperclip':'\ud83d\udcce',
      'paperclips':'\ud83d\udd87',
      'parasol_on_ground':'\u26f1',
      'parking':'\ud83c\udd7f\ufe0f',
      'part_alternation_mark':'\u303d\ufe0f',
      'partly_sunny':'\u26c5\ufe0f',
      'passenger_ship':'\ud83d\udef3',
      'passport_control':'\ud83d\udec2',
      'pause_button':'\u23f8',
      'peace_symbol':'\u262e\ufe0f',
      'peach':'\ud83c\udf51',
      'peanuts':'\ud83e\udd5c',
      'pear':'\ud83c\udf50',
      'pen':'\ud83d\udd8a',
      'pencil2':'\u270f\ufe0f',
      'penguin':'\ud83d\udc27',
      'pensive':'\ud83d\ude14',
      'performing_arts':'\ud83c\udfad',
      'persevere':'\ud83d\ude23',
      'person_fencing':'\ud83e\udd3a',
      'pouting_woman':'\ud83d\ude4e',
      'phone':'\u260e\ufe0f',
      'pick':'\u26cf',
      'pig':'\ud83d\udc37',
      'pig2':'\ud83d\udc16',
      'pig_nose':'\ud83d\udc3d',
      'pill':'\ud83d\udc8a',
      'pineapple':'\ud83c\udf4d',
      'ping_pong':'\ud83c\udfd3',
      'pisces':'\u2653\ufe0f',
      'pizza':'\ud83c\udf55',
      'place_of_worship':'\ud83d\uded0',
      'plate_with_cutlery':'\ud83c\udf7d',
      'play_or_pause_button':'\u23ef',
      'point_down':'\ud83d\udc47',
      'point_left':'\ud83d\udc48',
      'point_right':'\ud83d\udc49',
      'point_up':'\u261d\ufe0f',
      'point_up_2':'\ud83d\udc46',
      'police_car':'\ud83d\ude93',
      'policewoman':'\ud83d\udc6e&zwj;\u2640\ufe0f',
      'poodle':'\ud83d\udc29',
      'popcorn':'\ud83c\udf7f',
      'post_office':'\ud83c\udfe3',
      'postal_horn':'\ud83d\udcef',
      'postbox':'\ud83d\udcee',
      'potable_water':'\ud83d\udeb0',
      'potato':'\ud83e\udd54',
      'pouch':'\ud83d\udc5d',
      'poultry_leg':'\ud83c\udf57',
      'pound':'\ud83d\udcb7',
      'rage':'\ud83d\ude21',
      'pouting_cat':'\ud83d\ude3e',
      'pouting_man':'\ud83d\ude4e&zwj;\u2642\ufe0f',
      'pray':'\ud83d\ude4f',
      'prayer_beads':'\ud83d\udcff',
      'pregnant_woman':'\ud83e\udd30',
      'previous_track_button':'\u23ee',
      'prince':'\ud83e\udd34',
      'princess':'\ud83d\udc78',
      'printer':'\ud83d\udda8',
      'purple_heart':'\ud83d\udc9c',
      'purse':'\ud83d\udc5b',
      'pushpin':'\ud83d\udccc',
      'put_litter_in_its_place':'\ud83d\udeae',
      'question':'\u2753',
      'rabbit':'\ud83d\udc30',
      'rabbit2':'\ud83d\udc07',
      'racehorse':'\ud83d\udc0e',
      'racing_car':'\ud83c\udfce',
      'radio':'\ud83d\udcfb',
      'radio_button':'\ud83d\udd18',
      'radioactive':'\u2622\ufe0f',
      'railway_car':'\ud83d\ude83',
      'railway_track':'\ud83d\udee4',
      'rainbow':'\ud83c\udf08',
      'rainbow_flag':'\ud83c\udff3\ufe0f&zwj;\ud83c\udf08',
      'raised_back_of_hand':'\ud83e\udd1a',
      'raised_hand_with_fingers_splayed':'\ud83d\udd90',
      'raised_hands':'\ud83d\ude4c',
      'raising_hand_woman':'\ud83d\ude4b',
      'raising_hand_man':'\ud83d\ude4b&zwj;\u2642\ufe0f',
      'ram':'\ud83d\udc0f',
      'ramen':'\ud83c\udf5c',
      'rat':'\ud83d\udc00',
      'record_button':'\u23fa',
      'recycle':'\u267b\ufe0f',
      'red_circle':'\ud83d\udd34',
      'registered':'\u00ae\ufe0f',
      'relaxed':'\u263a\ufe0f',
      'relieved':'\ud83d\ude0c',
      'reminder_ribbon':'\ud83c\udf97',
      'repeat':'\ud83d\udd01',
      'repeat_one':'\ud83d\udd02',
      'rescue_worker_helmet':'\u26d1',
      'restroom':'\ud83d\udebb',
      'revolving_hearts':'\ud83d\udc9e',
      'rewind':'\u23ea',
      'rhinoceros':'\ud83e\udd8f',
      'ribbon':'\ud83c\udf80',
      'rice':'\ud83c\udf5a',
      'rice_ball':'\ud83c\udf59',
      'rice_cracker':'\ud83c\udf58',
      'rice_scene':'\ud83c\udf91',
      'right_anger_bubble':'\ud83d\uddef',
      'ring':'\ud83d\udc8d',
      'robot':'\ud83e\udd16',
      'rocket':'\ud83d\ude80',
      'rofl':'\ud83e\udd23',
      'roll_eyes':'\ud83d\ude44',
      'roller_coaster':'\ud83c\udfa2',
      'rooster':'\ud83d\udc13',
      'rose':'\ud83c\udf39',
      'rosette':'\ud83c\udff5',
      'rotating_light':'\ud83d\udea8',
      'round_pushpin':'\ud83d\udccd',
      'rowing_man':'\ud83d\udea3',
      'rowing_woman':'\ud83d\udea3&zwj;\u2640\ufe0f',
      'rugby_football':'\ud83c\udfc9',
      'running_man':'\ud83c\udfc3',
      'running_shirt_with_sash':'\ud83c\udfbd',
      'running_woman':'\ud83c\udfc3&zwj;\u2640\ufe0f',
      'sa':'\ud83c\ude02\ufe0f',
      'sagittarius':'\u2650\ufe0f',
      'sake':'\ud83c\udf76',
      'sandal':'\ud83d\udc61',
      'santa':'\ud83c\udf85',
      'satellite':'\ud83d\udce1',
      'saxophone':'\ud83c\udfb7',
      'school':'\ud83c\udfeb',
      'school_satchel':'\ud83c\udf92',
      'scissors':'\u2702\ufe0f',
      'scorpion':'\ud83e\udd82',
      'scorpius':'\u264f\ufe0f',
      'scream':'\ud83d\ude31',
      'scream_cat':'\ud83d\ude40',
      'scroll':'\ud83d\udcdc',
      'seat':'\ud83d\udcba',
      'secret':'\u3299\ufe0f',
      'see_no_evil':'\ud83d\ude48',
      'seedling':'\ud83c\udf31',
      'selfie':'\ud83e\udd33',
      'shallow_pan_of_food':'\ud83e\udd58',
      'shamrock':'\u2618\ufe0f',
      'shark':'\ud83e\udd88',
      'shaved_ice':'\ud83c\udf67',
      'sheep':'\ud83d\udc11',
      'shell':'\ud83d\udc1a',
      'shield':'\ud83d\udee1',
      'shinto_shrine':'\u26e9',
      'ship':'\ud83d\udea2',
      'shirt':'\ud83d\udc55',
      'shopping':'\ud83d\udecd',
      'shopping_cart':'\ud83d\uded2',
      'shower':'\ud83d\udebf',
      'shrimp':'\ud83e\udd90',
      'signal_strength':'\ud83d\udcf6',
      'six_pointed_star':'\ud83d\udd2f',
      'ski':'\ud83c\udfbf',
      'skier':'\u26f7',
      'skull':'\ud83d\udc80',
      'skull_and_crossbones':'\u2620\ufe0f',
      'sleeping':'\ud83d\ude34',
      'sleeping_bed':'\ud83d\udecc',
      'sleepy':'\ud83d\ude2a',
      'slightly_frowning_face':'\ud83d\ude41',
      'slightly_smiling_face':'\ud83d\ude42',
      'slot_machine':'\ud83c\udfb0',
      'small_airplane':'\ud83d\udee9',
      'small_blue_diamond':'\ud83d\udd39',
      'small_orange_diamond':'\ud83d\udd38',
      'small_red_triangle':'\ud83d\udd3a',
      'small_red_triangle_down':'\ud83d\udd3b',
      'smile':'\ud83d\ude04',
      'smile_cat':'\ud83d\ude38',
      'smiley':'\ud83d\ude03',
      'smiley_cat':'\ud83d\ude3a',
      'smiling_imp':'\ud83d\ude08',
      'smirk':'\ud83d\ude0f',
      'smirk_cat':'\ud83d\ude3c',
      'smoking':'\ud83d\udeac',
      'snail':'\ud83d\udc0c',
      'snake':'\ud83d\udc0d',
      'sneezing_face':'\ud83e\udd27',
      'snowboarder':'\ud83c\udfc2',
      'snowflake':'\u2744\ufe0f',
      'snowman':'\u26c4\ufe0f',
      'snowman_with_snow':'\u2603\ufe0f',
      'sob':'\ud83d\ude2d',
      'soccer':'\u26bd\ufe0f',
      'soon':'\ud83d\udd1c',
      'sos':'\ud83c\udd98',
      'sound':'\ud83d\udd09',
      'space_invader':'\ud83d\udc7e',
      'spades':'\u2660\ufe0f',
      'spaghetti':'\ud83c\udf5d',
      'sparkle':'\u2747\ufe0f',
      'sparkler':'\ud83c\udf87',
      'sparkles':'\u2728',
      'sparkling_heart':'\ud83d\udc96',
      'speak_no_evil':'\ud83d\ude4a',
      'speaker':'\ud83d\udd08',
      'speaking_head':'\ud83d\udde3',
      'speech_balloon':'\ud83d\udcac',
      'speedboat':'\ud83d\udea4',
      'spider':'\ud83d\udd77',
      'spider_web':'\ud83d\udd78',
      'spiral_calendar':'\ud83d\uddd3',
      'spiral_notepad':'\ud83d\uddd2',
      'spoon':'\ud83e\udd44',
      'squid':'\ud83e\udd91',
      'stadium':'\ud83c\udfdf',
      'star':'\u2b50\ufe0f',
      'star2':'\ud83c\udf1f',
      'star_and_crescent':'\u262a\ufe0f',
      'star_of_david':'\u2721\ufe0f',
      'stars':'\ud83c\udf20',
      'station':'\ud83d\ude89',
      'statue_of_liberty':'\ud83d\uddfd',
      'steam_locomotive':'\ud83d\ude82',
      'stew':'\ud83c\udf72',
      'stop_button':'\u23f9',
      'stop_sign':'\ud83d\uded1',
      'stopwatch':'\u23f1',
      'straight_ruler':'\ud83d\udccf',
      'strawberry':'\ud83c\udf53',
      'stuck_out_tongue':'\ud83d\ude1b',
      'stuck_out_tongue_closed_eyes':'\ud83d\ude1d',
      'stuck_out_tongue_winking_eye':'\ud83d\ude1c',
      'studio_microphone':'\ud83c\udf99',
      'stuffed_flatbread':'\ud83e\udd59',
      'sun_behind_large_cloud':'\ud83c\udf25',
      'sun_behind_rain_cloud':'\ud83c\udf26',
      'sun_behind_small_cloud':'\ud83c\udf24',
      'sun_with_face':'\ud83c\udf1e',
      'sunflower':'\ud83c\udf3b',
      'sunglasses':'\ud83d\ude0e',
      'sunny':'\u2600\ufe0f',
      'sunrise':'\ud83c\udf05',
      'sunrise_over_mountains':'\ud83c\udf04',
      'surfing_man':'\ud83c\udfc4',
      'surfing_woman':'\ud83c\udfc4&zwj;\u2640\ufe0f',
      'sushi':'\ud83c\udf63',
      'suspension_railway':'\ud83d\ude9f',
      'sweat':'\ud83d\ude13',
      'sweat_drops':'\ud83d\udca6',
      'sweat_smile':'\ud83d\ude05',
      'sweet_potato':'\ud83c\udf60',
      'swimming_man':'\ud83c\udfca',
      'swimming_woman':'\ud83c\udfca&zwj;\u2640\ufe0f',
      'symbols':'\ud83d\udd23',
      'synagogue':'\ud83d\udd4d',
      'syringe':'\ud83d\udc89',
      'taco':'\ud83c\udf2e',
      'tada':'\ud83c\udf89',
      'tanabata_tree':'\ud83c\udf8b',
      'taurus':'\u2649\ufe0f',
      'taxi':'\ud83d\ude95',
      'tea':'\ud83c\udf75',
      'telephone_receiver':'\ud83d\udcde',
      'telescope':'\ud83d\udd2d',
      'tennis':'\ud83c\udfbe',
      'tent':'\u26fa\ufe0f',
      'thermometer':'\ud83c\udf21',
      'thinking':'\ud83e\udd14',
      'thought_balloon':'\ud83d\udcad',
      'ticket':'\ud83c\udfab',
      'tickets':'\ud83c\udf9f',
      'tiger':'\ud83d\udc2f',
      'tiger2':'\ud83d\udc05',
      'timer_clock':'\u23f2',
      'tipping_hand_man':'\ud83d\udc81&zwj;\u2642\ufe0f',
      'tired_face':'\ud83d\ude2b',
      'tm':'\u2122\ufe0f',
      'toilet':'\ud83d\udebd',
      'tokyo_tower':'\ud83d\uddfc',
      'tomato':'\ud83c\udf45',
      'tongue':'\ud83d\udc45',
      'top':'\ud83d\udd1d',
      'tophat':'\ud83c\udfa9',
      'tornado':'\ud83c\udf2a',
      'trackball':'\ud83d\uddb2',
      'tractor':'\ud83d\ude9c',
      'traffic_light':'\ud83d\udea5',
      'train':'\ud83d\ude8b',
      'train2':'\ud83d\ude86',
      'tram':'\ud83d\ude8a',
      'triangular_flag_on_post':'\ud83d\udea9',
      'triangular_ruler':'\ud83d\udcd0',
      'trident':'\ud83d\udd31',
      'triumph':'\ud83d\ude24',
      'trolleybus':'\ud83d\ude8e',
      'trophy':'\ud83c\udfc6',
      'tropical_drink':'\ud83c\udf79',
      'tropical_fish':'\ud83d\udc20',
      'truck':'\ud83d\ude9a',
      'trumpet':'\ud83c\udfba',
      'tulip':'\ud83c\udf37',
      'tumbler_glass':'\ud83e\udd43',
      'turkey':'\ud83e\udd83',
      'turtle':'\ud83d\udc22',
      'tv':'\ud83d\udcfa',
      'twisted_rightwards_arrows':'\ud83d\udd00',
      'two_hearts':'\ud83d\udc95',
      'two_men_holding_hands':'\ud83d\udc6c',
      'two_women_holding_hands':'\ud83d\udc6d',
      'u5272':'\ud83c\ude39',
      'u5408':'\ud83c\ude34',
      'u55b6':'\ud83c\ude3a',
      'u6307':'\ud83c\ude2f\ufe0f',
      'u6708':'\ud83c\ude37\ufe0f',
      'u6709':'\ud83c\ude36',
      'u6e80':'\ud83c\ude35',
      'u7121':'\ud83c\ude1a\ufe0f',
      'u7533':'\ud83c\ude38',
      'u7981':'\ud83c\ude32',
      'u7a7a':'\ud83c\ude33',
      'umbrella':'\u2614\ufe0f',
      'unamused':'\ud83d\ude12',
      'underage':'\ud83d\udd1e',
      'unicorn':'\ud83e\udd84',
      'unlock':'\ud83d\udd13',
      'up':'\ud83c\udd99',
      'upside_down_face':'\ud83d\ude43',
      'v':'\u270c\ufe0f',
      'vertical_traffic_light':'\ud83d\udea6',
      'vhs':'\ud83d\udcfc',
      'vibration_mode':'\ud83d\udcf3',
      'video_camera':'\ud83d\udcf9',
      'video_game':'\ud83c\udfae',
      'violin':'\ud83c\udfbb',
      'virgo':'\u264d\ufe0f',
      'volcano':'\ud83c\udf0b',
      'volleyball':'\ud83c\udfd0',
      'vs':'\ud83c\udd9a',
      'vulcan_salute':'\ud83d\udd96',
      'walking_man':'\ud83d\udeb6',
      'walking_woman':'\ud83d\udeb6&zwj;\u2640\ufe0f',
      'waning_crescent_moon':'\ud83c\udf18',
      'waning_gibbous_moon':'\ud83c\udf16',
      'warning':'\u26a0\ufe0f',
      'wastebasket':'\ud83d\uddd1',
      'watch':'\u231a\ufe0f',
      'water_buffalo':'\ud83d\udc03',
      'watermelon':'\ud83c\udf49',
      'wave':'\ud83d\udc4b',
      'wavy_dash':'\u3030\ufe0f',
      'waxing_crescent_moon':'\ud83c\udf12',
      'wc':'\ud83d\udebe',
      'weary':'\ud83d\ude29',
      'wedding':'\ud83d\udc92',
      'weight_lifting_man':'\ud83c\udfcb\ufe0f',
      'weight_lifting_woman':'\ud83c\udfcb\ufe0f&zwj;\u2640\ufe0f',
      'whale':'\ud83d\udc33',
      'whale2':'\ud83d\udc0b',
      'wheel_of_dharma':'\u2638\ufe0f',
      'wheelchair':'\u267f\ufe0f',
      'white_check_mark':'\u2705',
      'white_circle':'\u26aa\ufe0f',
      'white_flag':'\ud83c\udff3\ufe0f',
      'white_flower':'\ud83d\udcae',
      'white_large_square':'\u2b1c\ufe0f',
      'white_medium_small_square':'\u25fd\ufe0f',
      'white_medium_square':'\u25fb\ufe0f',
      'white_small_square':'\u25ab\ufe0f',
      'white_square_button':'\ud83d\udd33',
      'wilted_flower':'\ud83e\udd40',
      'wind_chime':'\ud83c\udf90',
      'wind_face':'\ud83c\udf2c',
      'wine_glass':'\ud83c\udf77',
      'wink':'\ud83d\ude09',
      'wolf':'\ud83d\udc3a',
      'woman':'\ud83d\udc69',
      'woman_artist':'\ud83d\udc69&zwj;\ud83c\udfa8',
      'woman_astronaut':'\ud83d\udc69&zwj;\ud83d\ude80',
      'woman_cartwheeling':'\ud83e\udd38&zwj;\u2640\ufe0f',
      'woman_cook':'\ud83d\udc69&zwj;\ud83c\udf73',
      'woman_facepalming':'\ud83e\udd26&zwj;\u2640\ufe0f',
      'woman_factory_worker':'\ud83d\udc69&zwj;\ud83c\udfed',
      'woman_farmer':'\ud83d\udc69&zwj;\ud83c\udf3e',
      'woman_firefighter':'\ud83d\udc69&zwj;\ud83d\ude92',
      'woman_health_worker':'\ud83d\udc69&zwj;\u2695\ufe0f',
      'woman_judge':'\ud83d\udc69&zwj;\u2696\ufe0f',
      'woman_juggling':'\ud83e\udd39&zwj;\u2640\ufe0f',
      'woman_mechanic':'\ud83d\udc69&zwj;\ud83d\udd27',
      'woman_office_worker':'\ud83d\udc69&zwj;\ud83d\udcbc',
      'woman_pilot':'\ud83d\udc69&zwj;\u2708\ufe0f',
      'woman_playing_handball':'\ud83e\udd3e&zwj;\u2640\ufe0f',
      'woman_playing_water_polo':'\ud83e\udd3d&zwj;\u2640\ufe0f',
      'woman_scientist':'\ud83d\udc69&zwj;\ud83d\udd2c',
      'woman_shrugging':'\ud83e\udd37&zwj;\u2640\ufe0f',
      'woman_singer':'\ud83d\udc69&zwj;\ud83c\udfa4',
      'woman_student':'\ud83d\udc69&zwj;\ud83c\udf93',
      'woman_teacher':'\ud83d\udc69&zwj;\ud83c\udfeb',
      'woman_technologist':'\ud83d\udc69&zwj;\ud83d\udcbb',
      'woman_with_turban':'\ud83d\udc73&zwj;\u2640\ufe0f',
      'womans_clothes':'\ud83d\udc5a',
      'womans_hat':'\ud83d\udc52',
      'women_wrestling':'\ud83e\udd3c&zwj;\u2640\ufe0f',
      'womens':'\ud83d\udeba',
      'world_map':'\ud83d\uddfa',
      'worried':'\ud83d\ude1f',
      'wrench':'\ud83d\udd27',
      'writing_hand':'\u270d\ufe0f',
      'x':'\u274c',
      'yellow_heart':'\ud83d\udc9b',
      'yen':'\ud83d\udcb4',
      'yin_yang':'\u262f\ufe0f',
      'yum':'\ud83d\ude0b',
      'zap':'\u26a1\ufe0f',
      'zipper_mouth_face':'\ud83e\udd10',
      'zzz':'\ud83d\udca4',

      /* special emojis :P */
      'octocat':  '<img alt=":octocat:" height="20" width="20" align="absmiddle" src="https://assets-cdn.github.com/images/icons/emoji/octocat.png">',
      'showdown': '<span style="font-family: \'Anonymous Pro\', monospace; text-decoration: underline; text-decoration-style: dashed; text-decoration-color: #3e8b8a;text-underline-position: under;">S</span>'
    };

    /**
     * Created by Estevao on 31-05-2015.
     */

    /**
     * Showdown Converter class
     * @class
     * @param {object} [converterOptions]
     * @returns {Converter}
     */
    showdown.Converter = function (converterOptions) {

      var
          /**
           * Options used by this converter
           * @private
           * @type {{}}
           */
          options = {},

          /**
           * Language extensions used by this converter
           * @private
           * @type {Array}
           */
          langExtensions = [],

          /**
           * Output modifiers extensions used by this converter
           * @private
           * @type {Array}
           */
          outputModifiers = [],

          /**
           * Event listeners
           * @private
           * @type {{}}
           */
          listeners = {},

          /**
           * The flavor set in this converter
           */
          setConvFlavor = setFlavor,

          /**
           * Metadata of the document
           * @type {{parsed: {}, raw: string, format: string}}
           */
          metadata = {
            parsed: {},
            raw: '',
            format: ''
          };

      _constructor();

      /**
       * Converter constructor
       * @private
       */
      function _constructor () {
        converterOptions = converterOptions || {};

        for (var gOpt in globalOptions) {
          if (globalOptions.hasOwnProperty(gOpt)) {
            options[gOpt] = globalOptions[gOpt];
          }
        }

        // Merge options
        if (typeof converterOptions === 'object') {
          for (var opt in converterOptions) {
            if (converterOptions.hasOwnProperty(opt)) {
              options[opt] = converterOptions[opt];
            }
          }
        } else {
          throw Error('Converter expects the passed parameter to be an object, but ' + typeof converterOptions +
          ' was passed instead.');
        }

        if (options.extensions) {
          showdown.helper.forEach(options.extensions, _parseExtension);
        }
      }

      /**
       * Parse extension
       * @param {*} ext
       * @param {string} [name='']
       * @private
       */
      function _parseExtension (ext, name) {

        name = name || null;
        // If it's a string, the extension was previously loaded
        if (showdown.helper.isString(ext)) {
          ext = showdown.helper.stdExtName(ext);
          name = ext;

          // LEGACY_SUPPORT CODE
          if (showdown.extensions[ext]) {
            console.warn('DEPRECATION WARNING: ' + ext + ' is an old extension that uses a deprecated loading method.' +
              'Please inform the developer that the extension should be updated!');
            legacyExtensionLoading(showdown.extensions[ext], ext);
            return;
            // END LEGACY SUPPORT CODE

          } else if (!showdown.helper.isUndefined(extensions[ext])) {
            ext = extensions[ext];

          } else {
            throw Error('Extension "' + ext + '" could not be loaded. It was either not found or is not a valid extension.');
          }
        }

        if (typeof ext === 'function') {
          ext = ext();
        }

        if (!showdown.helper.isArray(ext)) {
          ext = [ext];
        }

        var validExt = validate(ext, name);
        if (!validExt.valid) {
          throw Error(validExt.error);
        }

        for (var i = 0; i < ext.length; ++i) {
          switch (ext[i].type) {

            case 'lang':
              langExtensions.push(ext[i]);
              break;

            case 'output':
              outputModifiers.push(ext[i]);
              break;
          }
          if (ext[i].hasOwnProperty('listeners')) {
            for (var ln in ext[i].listeners) {
              if (ext[i].listeners.hasOwnProperty(ln)) {
                listen(ln, ext[i].listeners[ln]);
              }
            }
          }
        }

      }

      /**
       * LEGACY_SUPPORT
       * @param {*} ext
       * @param {string} name
       */
      function legacyExtensionLoading (ext, name) {
        if (typeof ext === 'function') {
          ext = ext(new showdown.Converter());
        }
        if (!showdown.helper.isArray(ext)) {
          ext = [ext];
        }
        var valid = validate(ext, name);

        if (!valid.valid) {
          throw Error(valid.error);
        }

        for (var i = 0; i < ext.length; ++i) {
          switch (ext[i].type) {
            case 'lang':
              langExtensions.push(ext[i]);
              break;
            case 'output':
              outputModifiers.push(ext[i]);
              break;
            default:// should never reach here
              throw Error('Extension loader error: Type unrecognized!!!');
          }
        }
      }

      /**
       * Listen to an event
       * @param {string} name
       * @param {function} callback
       */
      function listen (name, callback) {
        if (!showdown.helper.isString(name)) {
          throw Error('Invalid argument in converter.listen() method: name must be a string, but ' + typeof name + ' given');
        }

        if (typeof callback !== 'function') {
          throw Error('Invalid argument in converter.listen() method: callback must be a function, but ' + typeof callback + ' given');
        }

        if (!listeners.hasOwnProperty(name)) {
          listeners[name] = [];
        }
        listeners[name].push(callback);
      }

      function rTrimInputText (text) {
        var rsp = text.match(/^\s*/)[0].length,
            rgx = new RegExp('^\\s{0,' + rsp + '}', 'gm');
        return text.replace(rgx, '');
      }

      /**
       * Dispatch an event
       * @private
       * @param {string} evtName Event name
       * @param {string} text Text
       * @param {{}} options Converter Options
       * @param {{}} globals
       * @returns {string}
       */
      this._dispatch = function dispatch (evtName, text, options, globals) {
        if (listeners.hasOwnProperty(evtName)) {
          for (var ei = 0; ei < listeners[evtName].length; ++ei) {
            var nText = listeners[evtName][ei](evtName, text, this, options, globals);
            if (nText && typeof nText !== 'undefined') {
              text = nText;
            }
          }
        }
        return text;
      };

      /**
       * Listen to an event
       * @param {string} name
       * @param {function} callback
       * @returns {showdown.Converter}
       */
      this.listen = function (name, callback) {
        listen(name, callback);
        return this;
      };

      /**
       * Converts a markdown string into HTML
       * @param {string} text
       * @returns {*}
       */
      this.makeHtml = function (text) {
        //check if text is not falsy
        if (!text) {
          return text;
        }

        var globals = {
          gHtmlBlocks:     [],
          gHtmlMdBlocks:   [],
          gHtmlSpans:      [],
          gUrls:           {},
          gTitles:         {},
          gDimensions:     {},
          gListLevel:      0,
          hashLinkCounts:  {},
          langExtensions:  langExtensions,
          outputModifiers: outputModifiers,
          converter:       this,
          ghCodeBlocks:    [],
          metadata: {
            parsed: {},
            raw: '',
            format: ''
          }
        };

        // This lets us use ¨ trema as an escape char to avoid md5 hashes
        // The choice of character is arbitrary; anything that isn't
        // magic in Markdown will work.
        text = text.replace(/¨/g, '¨T');

        // Replace $ with ¨D
        // RegExp interprets $ as a special character
        // when it's in a replacement string
        text = text.replace(/\$/g, '¨D');

        // Standardize line endings
        text = text.replace(/\r\n/g, '\n'); // DOS to Unix
        text = text.replace(/\r/g, '\n'); // Mac to Unix

        // Stardardize line spaces
        text = text.replace(/\u00A0/g, '&nbsp;');

        if (options.smartIndentationFix) {
          text = rTrimInputText(text);
        }

        // Make sure text begins and ends with a couple of newlines:
        text = '\n\n' + text + '\n\n';

        // detab
        text = showdown.subParser('detab')(text, options, globals);

        /**
         * Strip any lines consisting only of spaces and tabs.
         * This makes subsequent regexs easier to write, because we can
         * match consecutive blank lines with /\n+/ instead of something
         * contorted like /[ \t]*\n+/
         */
        text = text.replace(/^[ \t]+$/mg, '');

        //run languageExtensions
        showdown.helper.forEach(langExtensions, function (ext) {
          text = showdown.subParser('runExtension')(ext, text, options, globals);
        });

        // run the sub parsers
        text = showdown.subParser('metadata')(text, options, globals);
        text = showdown.subParser('hashPreCodeTags')(text, options, globals);
        text = showdown.subParser('githubCodeBlocks')(text, options, globals);
        text = showdown.subParser('hashHTMLBlocks')(text, options, globals);
        text = showdown.subParser('hashCodeTags')(text, options, globals);
        text = showdown.subParser('stripLinkDefinitions')(text, options, globals);
        text = showdown.subParser('blockGamut')(text, options, globals);
        text = showdown.subParser('unhashHTMLSpans')(text, options, globals);
        text = showdown.subParser('unescapeSpecialChars')(text, options, globals);

        // attacklab: Restore dollar signs
        text = text.replace(/¨D/g, '$$');

        // attacklab: Restore tremas
        text = text.replace(/¨T/g, '¨');

        // render a complete html document instead of a partial if the option is enabled
        text = showdown.subParser('completeHTMLDocument')(text, options, globals);

        // Run output modifiers
        showdown.helper.forEach(outputModifiers, function (ext) {
          text = showdown.subParser('runExtension')(ext, text, options, globals);
        });

        // update metadata
        metadata = globals.metadata;
        return text;
      };

      /**
       * Converts an HTML string into a markdown string
       * @param src
       * @param [HTMLParser] A WHATWG DOM and HTML parser, such as JSDOM. If none is supplied, window.document will be used.
       * @returns {string}
       */
      this.makeMarkdown = this.makeMd = function (src, HTMLParser) {

        // replace \r\n with \n
        src = src.replace(/\r\n/g, '\n');
        src = src.replace(/\r/g, '\n'); // old macs

        // due to an edge case, we need to find this: > <
        // to prevent removing of non silent white spaces
        // ex: <em>this is</em> <strong>sparta</strong>
        src = src.replace(/>[ \t]+</, '>¨NBSP;<');

        if (!HTMLParser) {
          if (window && window.document) {
            HTMLParser = window.document;
          } else {
            throw new Error('HTMLParser is undefined. If in a webworker or nodejs environment, you need to provide a WHATWG DOM and HTML such as JSDOM');
          }
        }

        var doc = HTMLParser.createElement('div');
        doc.innerHTML = src;

        var globals = {
          preList: substitutePreCodeTags(doc)
        };

        // remove all newlines and collapse spaces
        clean(doc);

        // some stuff, like accidental reference links must now be escaped
        // TODO
        // doc.innerHTML = doc.innerHTML.replace(/\[[\S\t ]]/);

        var nodes = doc.childNodes,
            mdDoc = '';

        for (var i = 0; i < nodes.length; i++) {
          mdDoc += showdown.subParser('makeMarkdown.node')(nodes[i], globals);
        }

        function clean (node) {
          for (var n = 0; n < node.childNodes.length; ++n) {
            var child = node.childNodes[n];
            if (child.nodeType === 3) {
              if (!/\S/.test(child.nodeValue)) {
                node.removeChild(child);
                --n;
              } else {
                child.nodeValue = child.nodeValue.split('\n').join(' ');
                child.nodeValue = child.nodeValue.replace(/(\s)+/g, '$1');
              }
            } else if (child.nodeType === 1) {
              clean(child);
            }
          }
        }

        // find all pre tags and replace contents with placeholder
        // we need this so that we can remove all indentation from html
        // to ease up parsing
        function substitutePreCodeTags (doc) {

          var pres = doc.querySelectorAll('pre'),
              presPH = [];

          for (var i = 0; i < pres.length; ++i) {

            if (pres[i].childElementCount === 1 && pres[i].firstChild.tagName.toLowerCase() === 'code') {
              var content = pres[i].firstChild.innerHTML.trim(),
                  language = pres[i].firstChild.getAttribute('data-language') || '';

              // if data-language attribute is not defined, then we look for class language-*
              if (language === '') {
                var classes = pres[i].firstChild.className.split(' ');
                for (var c = 0; c < classes.length; ++c) {
                  var matches = classes[c].match(/^language-(.+)$/);
                  if (matches !== null) {
                    language = matches[1];
                    break;
                  }
                }
              }

              // unescape html entities in content
              content = showdown.helper.unescapeHTMLEntities(content);

              presPH.push(content);
              pres[i].outerHTML = '<precode language="' + language + '" precodenum="' + i.toString() + '"></precode>';
            } else {
              presPH.push(pres[i].innerHTML);
              pres[i].innerHTML = '';
              pres[i].setAttribute('prenum', i.toString());
            }
          }
          return presPH;
        }

        return mdDoc;
      };

      /**
       * Set an option of this Converter instance
       * @param {string} key
       * @param {*} value
       */
      this.setOption = function (key, value) {
        options[key] = value;
      };

      /**
       * Get the option of this Converter instance
       * @param {string} key
       * @returns {*}
       */
      this.getOption = function (key) {
        return options[key];
      };

      /**
       * Get the options of this Converter instance
       * @returns {{}}
       */
      this.getOptions = function () {
        return options;
      };

      /**
       * Add extension to THIS converter
       * @param {{}} extension
       * @param {string} [name=null]
       */
      this.addExtension = function (extension, name) {
        name = name || null;
        _parseExtension(extension, name);
      };

      /**
       * Use a global registered extension with THIS converter
       * @param {string} extensionName Name of the previously registered extension
       */
      this.useExtension = function (extensionName) {
        _parseExtension(extensionName);
      };

      /**
       * Set the flavor THIS converter should use
       * @param {string} name
       */
      this.setFlavor = function (name) {
        if (!flavor.hasOwnProperty(name)) {
          throw Error(name + ' flavor was not found');
        }
        var preset = flavor[name];
        setConvFlavor = name;
        for (var option in preset) {
          if (preset.hasOwnProperty(option)) {
            options[option] = preset[option];
          }
        }
      };

      /**
       * Get the currently set flavor of this converter
       * @returns {string}
       */
      this.getFlavor = function () {
        return setConvFlavor;
      };

      /**
       * Remove an extension from THIS converter.
       * Note: This is a costly operation. It's better to initialize a new converter
       * and specify the extensions you wish to use
       * @param {Array} extension
       */
      this.removeExtension = function (extension) {
        if (!showdown.helper.isArray(extension)) {
          extension = [extension];
        }
        for (var a = 0; a < extension.length; ++a) {
          var ext = extension[a];
          for (var i = 0; i < langExtensions.length; ++i) {
            if (langExtensions[i] === ext) {
              langExtensions[i].splice(i, 1);
            }
          }
          for (var ii = 0; ii < outputModifiers.length; ++i) {
            if (outputModifiers[ii] === ext) {
              outputModifiers[ii].splice(i, 1);
            }
          }
        }
      };

      /**
       * Get all extension of THIS converter
       * @returns {{language: Array, output: Array}}
       */
      this.getAllExtensions = function () {
        return {
          language: langExtensions,
          output: outputModifiers
        };
      };

      /**
       * Get the metadata of the previously parsed document
       * @param raw
       * @returns {string|{}}
       */
      this.getMetadata = function (raw) {
        if (raw) {
          return metadata.raw;
        } else {
          return metadata.parsed;
        }
      };

      /**
       * Get the metadata format of the previously parsed document
       * @returns {string}
       */
      this.getMetadataFormat = function () {
        return metadata.format;
      };

      /**
       * Private: set a single key, value metadata pair
       * @param {string} key
       * @param {string} value
       */
      this._setMetadataPair = function (key, value) {
        metadata.parsed[key] = value;
      };

      /**
       * Private: set metadata format
       * @param {string} format
       */
      this._setMetadataFormat = function (format) {
        metadata.format = format;
      };

      /**
       * Private: set metadata raw text
       * @param {string} raw
       */
      this._setMetadataRaw = function (raw) {
        metadata.raw = raw;
      };
    };

    /**
     * Turn Markdown link shortcuts into XHTML <a> tags.
     */
    showdown.subParser('anchors', function (text, options, globals) {

      text = globals.converter._dispatch('anchors.before', text, options, globals);

      var writeAnchorTag = function (wholeMatch, linkText, linkId, url, m5, m6, title) {
        if (showdown.helper.isUndefined(title)) {
          title = '';
        }
        linkId = linkId.toLowerCase();

        // Special case for explicit empty url
        if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
          url = '';
        } else if (!url) {
          if (!linkId) {
            // lower-case and turn embedded newlines into spaces
            linkId = linkText.toLowerCase().replace(/ ?\n/g, ' ');
          }
          url = '#' + linkId;

          if (!showdown.helper.isUndefined(globals.gUrls[linkId])) {
            url = globals.gUrls[linkId];
            if (!showdown.helper.isUndefined(globals.gTitles[linkId])) {
              title = globals.gTitles[linkId];
            }
          } else {
            return wholeMatch;
          }
        }

        //url = showdown.helper.escapeCharacters(url, '*_', false); // replaced line to improve performance
        url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);

        var result = '<a href="' + url + '"';

        if (title !== '' && title !== null) {
          title = title.replace(/"/g, '&quot;');
          //title = showdown.helper.escapeCharacters(title, '*_', false); // replaced line to improve performance
          title = title.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
          result += ' title="' + title + '"';
        }

        // optionLinksInNewWindow only applies
        // to external links. Hash links (#) open in same page
        if (options.openLinksInNewWindow && !/^#/.test(url)) {
          // escaped _
          result += ' rel="noopener noreferrer" target="¨E95Eblank"';
        }

        result += '>' + linkText + '</a>';

        return result;
      };

      // First, handle reference-style links: [link text] [id]
      text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g, writeAnchorTag);

      // Next, inline-style links: [link text](url "optional title")
      // cases with crazy urls like ./image/cat1).png
      text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
        writeAnchorTag);

      // normal cases
      text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
        writeAnchorTag);

      // handle reference-style shortcuts: [link text]
      // These must come last in case you've also got [link test][1]
      // or [link test](/foo)
      text = text.replace(/\[([^\[\]]+)]()()()()()/g, writeAnchorTag);

      // Lastly handle GithubMentions if option is enabled
      if (options.ghMentions) {
        text = text.replace(/(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d.-]+?[a-z\d]+)*))/gmi, function (wm, st, escape, mentions, username) {
          if (escape === '\\') {
            return st + mentions;
          }

          //check if options.ghMentionsLink is a string
          if (!showdown.helper.isString(options.ghMentionsLink)) {
            throw new Error('ghMentionsLink option must be a string');
          }
          var lnk = options.ghMentionsLink.replace(/\{u}/g, username),
              target = '';
          if (options.openLinksInNewWindow) {
            target = ' rel="noopener noreferrer" target="¨E95Eblank"';
          }
          return st + '<a href="' + lnk + '"' + target + '>' + mentions + '</a>';
        });
      }

      text = globals.converter._dispatch('anchors.after', text, options, globals);
      return text;
    });

    // url allowed chars [a-z\d_.~:/?#[]@!$&'()*+,;=-]

    var simpleURLRegex  = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+?\.[^'">\s]+?)()(\1)?(?=\s|$)(?!["<>])/gi,
        simpleURLRegex2 = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]])?(\1)?(?=\s|$)(?!["<>])/gi,
        delimUrlRegex   = /()<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>()/gi,
        simpleMailRegex = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gmi,
        delimMailRegex  = /<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,

        replaceLink = function (options) {
          return function (wm, leadingMagicChars, link, m2, m3, trailingPunctuation, trailingMagicChars) {
            link = link.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
            var lnkTxt = link,
                append = '',
                target = '',
                lmc    = leadingMagicChars || '',
                tmc    = trailingMagicChars || '';
            if (/^www\./i.test(link)) {
              link = link.replace(/^www\./i, 'http://www.');
            }
            if (options.excludeTrailingPunctuationFromURLs && trailingPunctuation) {
              append = trailingPunctuation;
            }
            if (options.openLinksInNewWindow) {
              target = ' rel="noopener noreferrer" target="¨E95Eblank"';
            }
            return lmc + '<a href="' + link + '"' + target + '>' + lnkTxt + '</a>' + append + tmc;
          };
        },

        replaceMail = function (options, globals) {
          return function (wholeMatch, b, mail) {
            var href = 'mailto:';
            b = b || '';
            mail = showdown.subParser('unescapeSpecialChars')(mail, options, globals);
            if (options.encodeEmails) {
              href = showdown.helper.encodeEmailAddress(href + mail);
              mail = showdown.helper.encodeEmailAddress(mail);
            } else {
              href = href + mail;
            }
            return b + '<a href="' + href + '">' + mail + '</a>';
          };
        };

    showdown.subParser('autoLinks', function (text, options, globals) {

      text = globals.converter._dispatch('autoLinks.before', text, options, globals);

      text = text.replace(delimUrlRegex, replaceLink(options));
      text = text.replace(delimMailRegex, replaceMail(options, globals));

      text = globals.converter._dispatch('autoLinks.after', text, options, globals);

      return text;
    });

    showdown.subParser('simplifiedAutoLinks', function (text, options, globals) {

      if (!options.simplifiedAutoLink) {
        return text;
      }

      text = globals.converter._dispatch('simplifiedAutoLinks.before', text, options, globals);

      if (options.excludeTrailingPunctuationFromURLs) {
        text = text.replace(simpleURLRegex2, replaceLink(options));
      } else {
        text = text.replace(simpleURLRegex, replaceLink(options));
      }
      text = text.replace(simpleMailRegex, replaceMail(options, globals));

      text = globals.converter._dispatch('simplifiedAutoLinks.after', text, options, globals);

      return text;
    });

    /**
     * These are all the transformations that form block-level
     * tags like paragraphs, headers, and list items.
     */
    showdown.subParser('blockGamut', function (text, options, globals) {

      text = globals.converter._dispatch('blockGamut.before', text, options, globals);

      // we parse blockquotes first so that we can have headings and hrs
      // inside blockquotes
      text = showdown.subParser('blockQuotes')(text, options, globals);
      text = showdown.subParser('headers')(text, options, globals);

      // Do Horizontal Rules:
      text = showdown.subParser('horizontalRule')(text, options, globals);

      text = showdown.subParser('lists')(text, options, globals);
      text = showdown.subParser('codeBlocks')(text, options, globals);
      text = showdown.subParser('tables')(text, options, globals);

      // We already ran _HashHTMLBlocks() before, in Markdown(), but that
      // was to escape raw HTML in the original Markdown source. This time,
      // we're escaping the markup we've just created, so that we don't wrap
      // <p> tags around block-level tags.
      text = showdown.subParser('hashHTMLBlocks')(text, options, globals);
      text = showdown.subParser('paragraphs')(text, options, globals);

      text = globals.converter._dispatch('blockGamut.after', text, options, globals);

      return text;
    });

    showdown.subParser('blockQuotes', function (text, options, globals) {

      text = globals.converter._dispatch('blockQuotes.before', text, options, globals);

      // add a couple extra lines after the text and endtext mark
      text = text + '\n\n';

      var rgx = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;

      if (options.splitAdjacentBlockquotes) {
        rgx = /^ {0,3}>[\s\S]*?(?:\n\n)/gm;
      }

      text = text.replace(rgx, function (bq) {
        // attacklab: hack around Konqueror 3.5.4 bug:
        // "----------bug".replace(/^-/g,"") == "bug"
        bq = bq.replace(/^[ \t]*>[ \t]?/gm, ''); // trim one level of quoting

        // attacklab: clean up hack
        bq = bq.replace(/¨0/g, '');

        bq = bq.replace(/^[ \t]+$/gm, ''); // trim whitespace-only lines
        bq = showdown.subParser('githubCodeBlocks')(bq, options, globals);
        bq = showdown.subParser('blockGamut')(bq, options, globals); // recurse

        bq = bq.replace(/(^|\n)/g, '$1  ');
        // These leading spaces screw with <pre> content, so we need to fix that:
        bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (wholeMatch, m1) {
          var pre = m1;
          // attacklab: hack around Konqueror 3.5.4 bug:
          pre = pre.replace(/^  /mg, '¨0');
          pre = pre.replace(/¨0/g, '');
          return pre;
        });

        return showdown.subParser('hashBlock')('<blockquote>\n' + bq + '\n</blockquote>', options, globals);
      });

      text = globals.converter._dispatch('blockQuotes.after', text, options, globals);
      return text;
    });

    /**
     * Process Markdown `<pre><code>` blocks.
     */
    showdown.subParser('codeBlocks', function (text, options, globals) {

      text = globals.converter._dispatch('codeBlocks.before', text, options, globals);

      // sentinel workarounds for lack of \A and \Z, safari\khtml bug
      text += '¨0';

      var pattern = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;
      text = text.replace(pattern, function (wholeMatch, m1, m2) {
        var codeblock = m1,
            nextChar = m2,
            end = '\n';

        codeblock = showdown.subParser('outdent')(codeblock, options, globals);
        codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
        codeblock = showdown.subParser('detab')(codeblock, options, globals);
        codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
        codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing newlines

        if (options.omitExtraWLInCodeBlocks) {
          end = '';
        }

        codeblock = '<pre><code>' + codeblock + end + '</code></pre>';

        return showdown.subParser('hashBlock')(codeblock, options, globals) + nextChar;
      });

      // strip sentinel
      text = text.replace(/¨0/, '');

      text = globals.converter._dispatch('codeBlocks.after', text, options, globals);
      return text;
    });

    /**
     *
     *   *  Backtick quotes are used for <code></code> spans.
     *
     *   *  You can use multiple backticks as the delimiters if you want to
     *     include literal backticks in the code span. So, this input:
     *
     *         Just type ``foo `bar` baz`` at the prompt.
     *
     *       Will translate to:
     *
     *         <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
     *
     *    There's no arbitrary limit to the number of backticks you
     *    can use as delimters. If you need three consecutive backticks
     *    in your code, use four for delimiters, etc.
     *
     *  *  You can use spaces to get literal backticks at the edges:
     *
     *         ... type `` `bar` `` ...
     *
     *       Turns to:
     *
     *         ... type <code>`bar`</code> ...
     */
    showdown.subParser('codeSpans', function (text, options, globals) {

      text = globals.converter._dispatch('codeSpans.before', text, options, globals);

      if (typeof text === 'undefined') {
        text = '';
      }
      text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
        function (wholeMatch, m1, m2, m3) {
          var c = m3;
          c = c.replace(/^([ \t]*)/g, '');	// leading whitespace
          c = c.replace(/[ \t]*$/g, '');	// trailing whitespace
          c = showdown.subParser('encodeCode')(c, options, globals);
          c = m1 + '<code>' + c + '</code>';
          c = showdown.subParser('hashHTMLSpans')(c, options, globals);
          return c;
        }
      );

      text = globals.converter._dispatch('codeSpans.after', text, options, globals);
      return text;
    });

    /**
     * Create a full HTML document from the processed markdown
     */
    showdown.subParser('completeHTMLDocument', function (text, options, globals) {

      if (!options.completeHTMLDocument) {
        return text;
      }

      text = globals.converter._dispatch('completeHTMLDocument.before', text, options, globals);

      var doctype = 'html',
          doctypeParsed = '<!DOCTYPE HTML>\n',
          title = '',
          charset = '<meta charset="utf-8">\n',
          lang = '',
          metadata = '';

      if (typeof globals.metadata.parsed.doctype !== 'undefined') {
        doctypeParsed = '<!DOCTYPE ' +  globals.metadata.parsed.doctype + '>\n';
        doctype = globals.metadata.parsed.doctype.toString().toLowerCase();
        if (doctype === 'html' || doctype === 'html5') {
          charset = '<meta charset="utf-8">';
        }
      }

      for (var meta in globals.metadata.parsed) {
        if (globals.metadata.parsed.hasOwnProperty(meta)) {
          switch (meta.toLowerCase()) {
            case 'doctype':
              break;

            case 'title':
              title = '<title>' +  globals.metadata.parsed.title + '</title>\n';
              break;

            case 'charset':
              if (doctype === 'html' || doctype === 'html5') {
                charset = '<meta charset="' + globals.metadata.parsed.charset + '">\n';
              } else {
                charset = '<meta name="charset" content="' + globals.metadata.parsed.charset + '">\n';
              }
              break;

            case 'language':
            case 'lang':
              lang = ' lang="' + globals.metadata.parsed[meta] + '"';
              metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
              break;

            default:
              metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
          }
        }
      }

      text = doctypeParsed + '<html' + lang + '>\n<head>\n' + title + charset + metadata + '</head>\n<body>\n' + text.trim() + '\n</body>\n</html>';

      text = globals.converter._dispatch('completeHTMLDocument.after', text, options, globals);
      return text;
    });

    /**
     * Convert all tabs to spaces
     */
    showdown.subParser('detab', function (text, options, globals) {
      text = globals.converter._dispatch('detab.before', text, options, globals);

      // expand first n-1 tabs
      text = text.replace(/\t(?=\t)/g, '    '); // g_tab_width

      // replace the nth with two sentinels
      text = text.replace(/\t/g, '¨A¨B');

      // use the sentinel to anchor our regex so it doesn't explode
      text = text.replace(/¨B(.+?)¨A/g, function (wholeMatch, m1) {
        var leadingText = m1,
            numSpaces = 4 - leadingText.length % 4;  // g_tab_width

        // there *must* be a better way to do this:
        for (var i = 0; i < numSpaces; i++) {
          leadingText += ' ';
        }

        return leadingText;
      });

      // clean up sentinels
      text = text.replace(/¨A/g, '    ');  // g_tab_width
      text = text.replace(/¨B/g, '');

      text = globals.converter._dispatch('detab.after', text, options, globals);
      return text;
    });

    showdown.subParser('ellipsis', function (text, options, globals) {

      text = globals.converter._dispatch('ellipsis.before', text, options, globals);

      text = text.replace(/\.\.\./g, '…');

      text = globals.converter._dispatch('ellipsis.after', text, options, globals);

      return text;
    });

    /**
     * Turn emoji codes into emojis
     *
     * List of supported emojis: https://github.com/showdownjs/showdown/wiki/Emojis
     */
    showdown.subParser('emoji', function (text, options, globals) {

      if (!options.emoji) {
        return text;
      }

      text = globals.converter._dispatch('emoji.before', text, options, globals);

      var emojiRgx = /:([\S]+?):/g;

      text = text.replace(emojiRgx, function (wm, emojiCode) {
        if (showdown.helper.emojis.hasOwnProperty(emojiCode)) {
          return showdown.helper.emojis[emojiCode];
        }
        return wm;
      });

      text = globals.converter._dispatch('emoji.after', text, options, globals);

      return text;
    });

    /**
     * Smart processing for ampersands and angle brackets that need to be encoded.
     */
    showdown.subParser('encodeAmpsAndAngles', function (text, options, globals) {
      text = globals.converter._dispatch('encodeAmpsAndAngles.before', text, options, globals);

      // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
      // http://bumppo.net/projects/amputator/
      text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, '&amp;');

      // Encode naked <'s
      text = text.replace(/<(?![a-z\/?$!])/gi, '&lt;');

      // Encode <
      text = text.replace(/</g, '&lt;');

      // Encode >
      text = text.replace(/>/g, '&gt;');

      text = globals.converter._dispatch('encodeAmpsAndAngles.after', text, options, globals);
      return text;
    });

    /**
     * Returns the string, with after processing the following backslash escape sequences.
     *
     * attacklab: The polite way to do this is with the new escapeCharacters() function:
     *
     *    text = escapeCharacters(text,"\\",true);
     *    text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
     *
     * ...but we're sidestepping its use of the (slow) RegExp constructor
     * as an optimization for Firefox.  This function gets called a LOT.
     */
    showdown.subParser('encodeBackslashEscapes', function (text, options, globals) {
      text = globals.converter._dispatch('encodeBackslashEscapes.before', text, options, globals);

      text = text.replace(/\\(\\)/g, showdown.helper.escapeCharactersCallback);
      text = text.replace(/\\([`*_{}\[\]()>#+.!~=|-])/g, showdown.helper.escapeCharactersCallback);

      text = globals.converter._dispatch('encodeBackslashEscapes.after', text, options, globals);
      return text;
    });

    /**
     * Encode/escape certain characters inside Markdown code runs.
     * The point is that in code, these characters are literals,
     * and lose their special Markdown meanings.
     */
    showdown.subParser('encodeCode', function (text, options, globals) {

      text = globals.converter._dispatch('encodeCode.before', text, options, globals);

      // Encode all ampersands; HTML entities are not
      // entities within a Markdown code span.
      text = text
        .replace(/&/g, '&amp;')
      // Do the angle bracket song and dance:
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      // Now, escape characters that are magic in Markdown:
        .replace(/([*_{}\[\]\\=~-])/g, showdown.helper.escapeCharactersCallback);

      text = globals.converter._dispatch('encodeCode.after', text, options, globals);
      return text;
    });

    /**
     * Within tags -- meaning between < and > -- encode [\ ` * _ ~ =] so they
     * don't conflict with their use in Markdown for code, italics and strong.
     */
    showdown.subParser('escapeSpecialCharsWithinTagAttributes', function (text, options, globals) {
      text = globals.converter._dispatch('escapeSpecialCharsWithinTagAttributes.before', text, options, globals);

      // Build a regex to find HTML tags.
      var tags     = /<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi,
          comments = /<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi;

      text = text.replace(tags, function (wholeMatch) {
        return wholeMatch
          .replace(/(.)<\/?code>(?=.)/g, '$1`')
          .replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
      });

      text = text.replace(comments, function (wholeMatch) {
        return wholeMatch
          .replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
      });

      text = globals.converter._dispatch('escapeSpecialCharsWithinTagAttributes.after', text, options, globals);
      return text;
    });

    /**
     * Handle github codeblocks prior to running HashHTML so that
     * HTML contained within the codeblock gets escaped properly
     * Example:
     * ```ruby
     *     def hello_world(x)
     *       puts "Hello, #{x}"
     *     end
     * ```
     */
    showdown.subParser('githubCodeBlocks', function (text, options, globals) {

      // early exit if option is not enabled
      if (!options.ghCodeBlocks) {
        return text;
      }

      text = globals.converter._dispatch('githubCodeBlocks.before', text, options, globals);

      text += '¨0';

      text = text.replace(/(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*)\n([\s\S]*?)\n(?: {0,3})\1/g, function (wholeMatch, delim, language, codeblock) {
        var end = (options.omitExtraWLInCodeBlocks) ? '' : '\n';

        // First parse the github code block
        codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
        codeblock = showdown.subParser('detab')(codeblock, options, globals);
        codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
        codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing whitespace

        codeblock = '<pre><code' + (language ? ' class="' + language + ' language-' + language + '"' : '') + '>' + codeblock + end + '</code></pre>';

        codeblock = showdown.subParser('hashBlock')(codeblock, options, globals);

        // Since GHCodeblocks can be false positives, we need to
        // store the primitive text and the parsed text in a global var,
        // and then return a token
        return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
      });

      // attacklab: strip sentinel
      text = text.replace(/¨0/, '');

      return globals.converter._dispatch('githubCodeBlocks.after', text, options, globals);
    });

    showdown.subParser('hashBlock', function (text, options, globals) {
      text = globals.converter._dispatch('hashBlock.before', text, options, globals);
      text = text.replace(/(^\n+|\n+$)/g, '');
      text = '\n\n¨K' + (globals.gHtmlBlocks.push(text) - 1) + 'K\n\n';
      text = globals.converter._dispatch('hashBlock.after', text, options, globals);
      return text;
    });

    /**
     * Hash and escape <code> elements that should not be parsed as markdown
     */
    showdown.subParser('hashCodeTags', function (text, options, globals) {
      text = globals.converter._dispatch('hashCodeTags.before', text, options, globals);

      var repFunc = function (wholeMatch, match, left, right) {
        var codeblock = left + showdown.subParser('encodeCode')(match, options, globals) + right;
        return '¨C' + (globals.gHtmlSpans.push(codeblock) - 1) + 'C';
      };

      // Hash naked <code>
      text = showdown.helper.replaceRecursiveRegExp(text, repFunc, '<code\\b[^>]*>', '</code>', 'gim');

      text = globals.converter._dispatch('hashCodeTags.after', text, options, globals);
      return text;
    });

    showdown.subParser('hashElement', function (text, options, globals) {

      return function (wholeMatch, m1) {
        var blockText = m1;

        // Undo double lines
        blockText = blockText.replace(/\n\n/g, '\n');
        blockText = blockText.replace(/^\n/, '');

        // strip trailing blank lines
        blockText = blockText.replace(/\n+$/g, '');

        // Replace the element text with a marker ("¨KxK" where x is its key)
        blockText = '\n\n¨K' + (globals.gHtmlBlocks.push(blockText) - 1) + 'K\n\n';

        return blockText;
      };
    });

    showdown.subParser('hashHTMLBlocks', function (text, options, globals) {
      text = globals.converter._dispatch('hashHTMLBlocks.before', text, options, globals);

      var blockTags = [
            'pre',
            'div',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'blockquote',
            'table',
            'dl',
            'ol',
            'ul',
            'script',
            'noscript',
            'form',
            'fieldset',
            'iframe',
            'math',
            'style',
            'section',
            'header',
            'footer',
            'nav',
            'article',
            'aside',
            'address',
            'audio',
            'canvas',
            'figure',
            'hgroup',
            'output',
            'video',
            'p'
          ],
          repFunc = function (wholeMatch, match, left, right) {
            var txt = wholeMatch;
            // check if this html element is marked as markdown
            // if so, it's contents should be parsed as markdown
            if (left.search(/\bmarkdown\b/) !== -1) {
              txt = left + globals.converter.makeHtml(match) + right;
            }
            return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
          };

      if (options.backslashEscapesHTMLTags) {
        // encode backslash escaped HTML tags
        text = text.replace(/\\<(\/?[^>]+?)>/g, function (wm, inside) {
          return '&lt;' + inside + '&gt;';
        });
      }

      // hash HTML Blocks
      for (var i = 0; i < blockTags.length; ++i) {

        var opTagPos,
            rgx1     = new RegExp('^ {0,3}(<' + blockTags[i] + '\\b[^>]*>)', 'im'),
            patLeft  = '<' + blockTags[i] + '\\b[^>]*>',
            patRight = '</' + blockTags[i] + '>';
        // 1. Look for the first position of the first opening HTML tag in the text
        while ((opTagPos = showdown.helper.regexIndexOf(text, rgx1)) !== -1) {

          // if the HTML tag is \ escaped, we need to escape it and break


          //2. Split the text in that position
          var subTexts = showdown.helper.splitAtIndex(text, opTagPos),
              //3. Match recursively
              newSubText1 = showdown.helper.replaceRecursiveRegExp(subTexts[1], repFunc, patLeft, patRight, 'im');

          // prevent an infinite loop
          if (newSubText1 === subTexts[1]) {
            break;
          }
          text = subTexts[0].concat(newSubText1);
        }
      }
      // HR SPECIAL CASE
      text = text.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,
        showdown.subParser('hashElement')(text, options, globals));

      // Special case for standalone HTML comments
      text = showdown.helper.replaceRecursiveRegExp(text, function (txt) {
        return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
      }, '^ {0,3}<!--', '-->', 'gm');

      // PHP and ASP-style processor instructions (<?...?> and <%...%>)
      text = text.replace(/(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,
        showdown.subParser('hashElement')(text, options, globals));

      text = globals.converter._dispatch('hashHTMLBlocks.after', text, options, globals);
      return text;
    });

    /**
     * Hash span elements that should not be parsed as markdown
     */
    showdown.subParser('hashHTMLSpans', function (text, options, globals) {
      text = globals.converter._dispatch('hashHTMLSpans.before', text, options, globals);

      function hashHTMLSpan (html) {
        return '¨C' + (globals.gHtmlSpans.push(html) - 1) + 'C';
      }

      // Hash Self Closing tags
      text = text.replace(/<[^>]+?\/>/gi, function (wm) {
        return hashHTMLSpan(wm);
      });

      // Hash tags without properties
      text = text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function (wm) {
        return hashHTMLSpan(wm);
      });

      // Hash tags with properties
      text = text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function (wm) {
        return hashHTMLSpan(wm);
      });

      // Hash self closing tags without />
      text = text.replace(/<[^>]+?>/gi, function (wm) {
        return hashHTMLSpan(wm);
      });

      /*showdown.helper.matchRecursiveRegExp(text, '<code\\b[^>]*>', '</code>', 'gi');*/

      text = globals.converter._dispatch('hashHTMLSpans.after', text, options, globals);
      return text;
    });

    /**
     * Unhash HTML spans
     */
    showdown.subParser('unhashHTMLSpans', function (text, options, globals) {
      text = globals.converter._dispatch('unhashHTMLSpans.before', text, options, globals);

      for (var i = 0; i < globals.gHtmlSpans.length; ++i) {
        var repText = globals.gHtmlSpans[i],
            // limiter to prevent infinite loop (assume 10 as limit for recurse)
            limit = 0;

        while (/¨C(\d+)C/.test(repText)) {
          var num = RegExp.$1;
          repText = repText.replace('¨C' + num + 'C', globals.gHtmlSpans[num]);
          if (limit === 10) {
            console.error('maximum nesting of 10 spans reached!!!');
            break;
          }
          ++limit;
        }
        text = text.replace('¨C' + i + 'C', repText);
      }

      text = globals.converter._dispatch('unhashHTMLSpans.after', text, options, globals);
      return text;
    });

    /**
     * Hash and escape <pre><code> elements that should not be parsed as markdown
     */
    showdown.subParser('hashPreCodeTags', function (text, options, globals) {
      text = globals.converter._dispatch('hashPreCodeTags.before', text, options, globals);

      var repFunc = function (wholeMatch, match, left, right) {
        // encode html entities
        var codeblock = left + showdown.subParser('encodeCode')(match, options, globals) + right;
        return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
      };

      // Hash <pre><code>
      text = showdown.helper.replaceRecursiveRegExp(text, repFunc, '^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>', '^ {0,3}</code>\\s*</pre>', 'gim');

      text = globals.converter._dispatch('hashPreCodeTags.after', text, options, globals);
      return text;
    });

    showdown.subParser('headers', function (text, options, globals) {

      text = globals.converter._dispatch('headers.before', text, options, globals);

      var headerLevelStart = (isNaN(parseInt(options.headerLevelStart))) ? 1 : parseInt(options.headerLevelStart),

          // Set text-style headers:
          //	Header 1
          //	========
          //
          //	Header 2
          //	--------
          //
          setextRegexH1 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm,
          setextRegexH2 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm;

      text = text.replace(setextRegexH1, function (wholeMatch, m1) {

        var spanGamut = showdown.subParser('spanGamut')(m1, options, globals),
            hID = (options.noHeaderId) ? '' : ' id="' + headerId(m1) + '"',
            hLevel = headerLevelStart,
            hashBlock = '<h' + hLevel + hID + '>' + spanGamut + '</h' + hLevel + '>';
        return showdown.subParser('hashBlock')(hashBlock, options, globals);
      });

      text = text.replace(setextRegexH2, function (matchFound, m1) {
        var spanGamut = showdown.subParser('spanGamut')(m1, options, globals),
            hID = (options.noHeaderId) ? '' : ' id="' + headerId(m1) + '"',
            hLevel = headerLevelStart + 1,
            hashBlock = '<h' + hLevel + hID + '>' + spanGamut + '</h' + hLevel + '>';
        return showdown.subParser('hashBlock')(hashBlock, options, globals);
      });

      // atx-style headers:
      //  # Header 1
      //  ## Header 2
      //  ## Header 2 with closing hashes ##
      //  ...
      //  ###### Header 6
      //
      var atxStyle = (options.requireSpaceBeforeHeadingText) ? /^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm : /^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;

      text = text.replace(atxStyle, function (wholeMatch, m1, m2) {
        var hText = m2;
        if (options.customizedHeaderId) {
          hText = m2.replace(/\s?\{([^{]+?)}\s*$/, '');
        }

        var span = showdown.subParser('spanGamut')(hText, options, globals),
            hID = (options.noHeaderId) ? '' : ' id="' + headerId(m2) + '"',
            hLevel = headerLevelStart - 1 + m1.length,
            header = '<h' + hLevel + hID + '>' + span + '</h' + hLevel + '>';

        return showdown.subParser('hashBlock')(header, options, globals);
      });

      function headerId (m) {
        var title,
            prefix;

        // It is separate from other options to allow combining prefix and customized
        if (options.customizedHeaderId) {
          var match = m.match(/\{([^{]+?)}\s*$/);
          if (match && match[1]) {
            m = match[1];
          }
        }

        title = m;

        // Prefix id to prevent causing inadvertent pre-existing style matches.
        if (showdown.helper.isString(options.prefixHeaderId)) {
          prefix = options.prefixHeaderId;
        } else if (options.prefixHeaderId === true) {
          prefix = 'section-';
        } else {
          prefix = '';
        }

        if (!options.rawPrefixHeaderId) {
          title = prefix + title;
        }

        if (options.ghCompatibleHeaderId) {
          title = title
            .replace(/ /g, '-')
            // replace previously escaped chars (&, ¨ and $)
            .replace(/&amp;/g, '')
            .replace(/¨T/g, '')
            .replace(/¨D/g, '')
            // replace rest of the chars (&~$ are repeated as they might have been escaped)
            // borrowed from github's redcarpet (some they should produce similar results)
            .replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g, '')
            .toLowerCase();
        } else if (options.rawHeaderId) {
          title = title
            .replace(/ /g, '-')
            // replace previously escaped chars (&, ¨ and $)
            .replace(/&amp;/g, '&')
            .replace(/¨T/g, '¨')
            .replace(/¨D/g, '$')
            // replace " and '
            .replace(/["']/g, '-')
            .toLowerCase();
        } else {
          title = title
            .replace(/[^\w]/g, '')
            .toLowerCase();
        }

        if (options.rawPrefixHeaderId) {
          title = prefix + title;
        }

        if (globals.hashLinkCounts[title]) {
          title = title + '-' + (globals.hashLinkCounts[title]++);
        } else {
          globals.hashLinkCounts[title] = 1;
        }
        return title;
      }

      text = globals.converter._dispatch('headers.after', text, options, globals);
      return text;
    });

    /**
     * Turn Markdown link shortcuts into XHTML <a> tags.
     */
    showdown.subParser('horizontalRule', function (text, options, globals) {
      text = globals.converter._dispatch('horizontalRule.before', text, options, globals);

      var key = showdown.subParser('hashBlock')('<hr />', options, globals);
      text = text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, key);
      text = text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, key);
      text = text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, key);

      text = globals.converter._dispatch('horizontalRule.after', text, options, globals);
      return text;
    });

    /**
     * Turn Markdown image shortcuts into <img> tags.
     */
    showdown.subParser('images', function (text, options, globals) {

      text = globals.converter._dispatch('images.before', text, options, globals);

      var inlineRegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
          crazyRegExp       = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g,
          base64RegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
          referenceRegExp   = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g,
          refShortcutRegExp = /!\[([^\[\]]+)]()()()()()/g;

      function writeImageTagBase64 (wholeMatch, altText, linkId, url, width, height, m5, title) {
        url = url.replace(/\s/g, '');
        return writeImageTag (wholeMatch, altText, linkId, url, width, height, m5, title);
      }

      function writeImageTag (wholeMatch, altText, linkId, url, width, height, m5, title) {

        var gUrls   = globals.gUrls,
            gTitles = globals.gTitles,
            gDims   = globals.gDimensions;

        linkId = linkId.toLowerCase();

        if (!title) {
          title = '';
        }
        // Special case for explicit empty url
        if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
          url = '';

        } else if (url === '' || url === null) {
          if (linkId === '' || linkId === null) {
            // lower-case and turn embedded newlines into spaces
            linkId = altText.toLowerCase().replace(/ ?\n/g, ' ');
          }
          url = '#' + linkId;

          if (!showdown.helper.isUndefined(gUrls[linkId])) {
            url = gUrls[linkId];
            if (!showdown.helper.isUndefined(gTitles[linkId])) {
              title = gTitles[linkId];
            }
            if (!showdown.helper.isUndefined(gDims[linkId])) {
              width = gDims[linkId].width;
              height = gDims[linkId].height;
            }
          } else {
            return wholeMatch;
          }
        }

        altText = altText
          .replace(/"/g, '&quot;')
        //altText = showdown.helper.escapeCharacters(altText, '*_', false);
          .replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
        //url = showdown.helper.escapeCharacters(url, '*_', false);
        url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
        var result = '<img src="' + url + '" alt="' + altText + '"';

        if (title && showdown.helper.isString(title)) {
          title = title
            .replace(/"/g, '&quot;')
          //title = showdown.helper.escapeCharacters(title, '*_', false);
            .replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
          result += ' title="' + title + '"';
        }

        if (width && height) {
          width  = (width === '*') ? 'auto' : width;
          height = (height === '*') ? 'auto' : height;

          result += ' width="' + width + '"';
          result += ' height="' + height + '"';
        }

        result += ' />';

        return result;
      }

      // First, handle reference-style labeled images: ![alt text][id]
      text = text.replace(referenceRegExp, writeImageTag);

      // Next, handle inline images:  ![alt text](url =<width>x<height> "optional title")

      // base64 encoded images
      text = text.replace(base64RegExp, writeImageTagBase64);

      // cases with crazy urls like ./image/cat1).png
      text = text.replace(crazyRegExp, writeImageTag);

      // normal cases
      text = text.replace(inlineRegExp, writeImageTag);

      // handle reference-style shortcuts: ![img text]
      text = text.replace(refShortcutRegExp, writeImageTag);

      text = globals.converter._dispatch('images.after', text, options, globals);
      return text;
    });

    showdown.subParser('italicsAndBold', function (text, options, globals) {

      text = globals.converter._dispatch('italicsAndBold.before', text, options, globals);

      // it's faster to have 3 separate regexes for each case than have just one
      // because of backtracing, in some cases, it could lead to an exponential effect
      // called "catastrophic backtrace". Ominous!

      function parseInside (txt, left, right) {
        /*
        if (options.simplifiedAutoLink) {
          txt = showdown.subParser('simplifiedAutoLinks')(txt, options, globals);
        }
        */
        return left + txt + right;
      }

      // Parse underscores
      if (options.literalMidWordUnderscores) {
        text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
          return parseInside (txt, '<strong><em>', '</em></strong>');
        });
        text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
          return parseInside (txt, '<strong>', '</strong>');
        });
        text = text.replace(/\b_(\S[\s\S]*?)_\b/g, function (wm, txt) {
          return parseInside (txt, '<em>', '</em>');
        });
      } else {
        text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
          return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', '</em></strong>') : wm;
        });
        text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
          return (/\S$/.test(m)) ? parseInside (m, '<strong>', '</strong>') : wm;
        });
        text = text.replace(/_([^\s_][\s\S]*?)_/g, function (wm, m) {
          // !/^_[^_]/.test(m) - test if it doesn't start with __ (since it seems redundant, we removed it)
          return (/\S$/.test(m)) ? parseInside (m, '<em>', '</em>') : wm;
        });
      }

      // Now parse asterisks
      if (options.literalMidWordAsterisks) {
        text = text.replace(/([^*]|^)\B\*\*\*(\S[\s\S]*?)\*\*\*\B(?!\*)/g, function (wm, lead, txt) {
          return parseInside (txt, lead + '<strong><em>', '</em></strong>');
        });
        text = text.replace(/([^*]|^)\B\*\*(\S[\s\S]*?)\*\*\B(?!\*)/g, function (wm, lead, txt) {
          return parseInside (txt, lead + '<strong>', '</strong>');
        });
        text = text.replace(/([^*]|^)\B\*(\S[\s\S]*?)\*\B(?!\*)/g, function (wm, lead, txt) {
          return parseInside (txt, lead + '<em>', '</em>');
        });
      } else {
        text = text.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g, function (wm, m) {
          return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', '</em></strong>') : wm;
        });
        text = text.replace(/\*\*(\S[\s\S]*?)\*\*/g, function (wm, m) {
          return (/\S$/.test(m)) ? parseInside (m, '<strong>', '</strong>') : wm;
        });
        text = text.replace(/\*([^\s*][\s\S]*?)\*/g, function (wm, m) {
          // !/^\*[^*]/.test(m) - test if it doesn't start with ** (since it seems redundant, we removed it)
          return (/\S$/.test(m)) ? parseInside (m, '<em>', '</em>') : wm;
        });
      }


      text = globals.converter._dispatch('italicsAndBold.after', text, options, globals);
      return text;
    });

    /**
     * Form HTML ordered (numbered) and unordered (bulleted) lists.
     */
    showdown.subParser('lists', function (text, options, globals) {

      /**
       * Process the contents of a single ordered or unordered list, splitting it
       * into individual list items.
       * @param {string} listStr
       * @param {boolean} trimTrailing
       * @returns {string}
       */
      function processListItems (listStr, trimTrailing) {
        // The $g_list_level global keeps track of when we're inside a list.
        // Each time we enter a list, we increment it; when we leave a list,
        // we decrement. If it's zero, we're not in a list anymore.
        //
        // We do this because when we're not inside a list, we want to treat
        // something like this:
        //
        //    I recommend upgrading to version
        //    8. Oops, now this line is treated
        //    as a sub-list.
        //
        // As a single paragraph, despite the fact that the second line starts
        // with a digit-period-space sequence.
        //
        // Whereas when we're inside a list (or sub-list), that line will be
        // treated as the start of a sub-list. What a kludge, huh? This is
        // an aspect of Markdown's syntax that's hard to parse perfectly
        // without resorting to mind-reading. Perhaps the solution is to
        // change the syntax rules such that sub-lists must start with a
        // starting cardinal number; e.g. "1." or "a.".
        globals.gListLevel++;

        // trim trailing blank lines:
        listStr = listStr.replace(/\n{2,}$/, '\n');

        // attacklab: add sentinel to emulate \z
        listStr += '¨0';

        var rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm,
            isParagraphed = (/\n[ \t]*\n(?!¨0)/.test(listStr));

        // Since version 1.5, nesting sublists requires 4 spaces (or 1 tab) indentation,
        // which is a syntax breaking change
        // activating this option reverts to old behavior
        if (options.disableForced4SpacesIndentedSublists) {
          rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm;
        }

        listStr = listStr.replace(rgx, function (wholeMatch, m1, m2, m3, m4, taskbtn, checked) {
          checked = (checked && checked.trim() !== '');

          var item = showdown.subParser('outdent')(m4, options, globals),
              bulletStyle = '';

          // Support for github tasklists
          if (taskbtn && options.tasklists) {
            bulletStyle = ' class="task-list-item" style="list-style-type: none;"';
            item = item.replace(/^[ \t]*\[(x|X| )?]/m, function () {
              var otp = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
              if (checked) {
                otp += ' checked';
              }
              otp += '>';
              return otp;
            });
          }

          // ISSUE #312
          // This input: - - - a
          // causes trouble to the parser, since it interprets it as:
          // <ul><li><li><li>a</li></li></li></ul>
          // instead of:
          // <ul><li>- - a</li></ul>
          // So, to prevent it, we will put a marker (¨A)in the beginning of the line
          // Kind of hackish/monkey patching, but seems more effective than overcomplicating the list parser
          item = item.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g, function (wm2) {
            return '¨A' + wm2;
          });

          // m1 - Leading line or
          // Has a double return (multi paragraph) or
          // Has sublist
          if (m1 || (item.search(/\n{2,}/) > -1)) {
            item = showdown.subParser('githubCodeBlocks')(item, options, globals);
            item = showdown.subParser('blockGamut')(item, options, globals);
          } else {
            // Recursion for sub-lists:
            item = showdown.subParser('lists')(item, options, globals);
            item = item.replace(/\n$/, ''); // chomp(item)
            item = showdown.subParser('hashHTMLBlocks')(item, options, globals);

            // Colapse double linebreaks
            item = item.replace(/\n\n+/g, '\n\n');
            if (isParagraphed) {
              item = showdown.subParser('paragraphs')(item, options, globals);
            } else {
              item = showdown.subParser('spanGamut')(item, options, globals);
            }
          }

          // now we need to remove the marker (¨A)
          item = item.replace('¨A', '');
          // we can finally wrap the line in list item tags
          item =  '<li' + bulletStyle + '>' + item + '</li>\n';

          return item;
        });

        // attacklab: strip sentinel
        listStr = listStr.replace(/¨0/g, '');

        globals.gListLevel--;

        if (trimTrailing) {
          listStr = listStr.replace(/\s+$/, '');
        }

        return listStr;
      }

      function styleStartNumber (list, listType) {
        // check if ol and starts by a number different than 1
        if (listType === 'ol') {
          var res = list.match(/^ *(\d+)\./);
          if (res && res[1] !== '1') {
            return ' start="' + res[1] + '"';
          }
        }
        return '';
      }

      /**
       * Check and parse consecutive lists (better fix for issue #142)
       * @param {string} list
       * @param {string} listType
       * @param {boolean} trimTrailing
       * @returns {string}
       */
      function parseConsecutiveLists (list, listType, trimTrailing) {
        // check if we caught 2 or more consecutive lists by mistake
        // we use the counterRgx, meaning if listType is UL we look for OL and vice versa
        var olRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?\d+\.[ \t]/gm : /^ {0,3}\d+\.[ \t]/gm,
            ulRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?[*+-][ \t]/gm : /^ {0,3}[*+-][ \t]/gm,
            counterRxg = (listType === 'ul') ? olRgx : ulRgx,
            result = '';

        if (list.search(counterRxg) !== -1) {
          (function parseCL (txt) {
            var pos = txt.search(counterRxg),
                style = styleStartNumber(list, listType);
            if (pos !== -1) {
              // slice
              result += '\n\n<' + listType + style + '>\n' + processListItems(txt.slice(0, pos), !!trimTrailing) + '</' + listType + '>\n';

              // invert counterType and listType
              listType = (listType === 'ul') ? 'ol' : 'ul';
              counterRxg = (listType === 'ul') ? olRgx : ulRgx;

              //recurse
              parseCL(txt.slice(pos));
            } else {
              result += '\n\n<' + listType + style + '>\n' + processListItems(txt, !!trimTrailing) + '</' + listType + '>\n';
            }
          })(list);
        } else {
          var style = styleStartNumber(list, listType);
          result = '\n\n<' + listType + style + '>\n' + processListItems(list, !!trimTrailing) + '</' + listType + '>\n';
        }

        return result;
      }

      /** Start of list parsing **/
      text = globals.converter._dispatch('lists.before', text, options, globals);
      // add sentinel to hack around khtml/safari bug:
      // http://bugs.webkit.org/show_bug.cgi?id=11231
      text += '¨0';

      if (globals.gListLevel) {
        text = text.replace(/^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
          function (wholeMatch, list, m2) {
            var listType = (m2.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
            return parseConsecutiveLists(list, listType, true);
          }
        );
      } else {
        text = text.replace(/(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
          function (wholeMatch, m1, list, m3) {
            var listType = (m3.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
            return parseConsecutiveLists(list, listType, false);
          }
        );
      }

      // strip sentinel
      text = text.replace(/¨0/, '');
      text = globals.converter._dispatch('lists.after', text, options, globals);
      return text;
    });

    /**
     * Parse metadata at the top of the document
     */
    showdown.subParser('metadata', function (text, options, globals) {

      if (!options.metadata) {
        return text;
      }

      text = globals.converter._dispatch('metadata.before', text, options, globals);

      function parseMetadataContents (content) {
        // raw is raw so it's not changed in any way
        globals.metadata.raw = content;

        // escape chars forbidden in html attributes
        // double quotes
        content = content
          // ampersand first
          .replace(/&/g, '&amp;')
          // double quotes
          .replace(/"/g, '&quot;');

        content = content.replace(/\n {4}/g, ' ');
        content.replace(/^([\S ]+): +([\s\S]+?)$/gm, function (wm, key, value) {
          globals.metadata.parsed[key] = value;
          return '';
        });
      }

      text = text.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/, function (wholematch, format, content) {
        parseMetadataContents(content);
        return '¨M';
      });

      text = text.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/, function (wholematch, format, content) {
        if (format) {
          globals.metadata.format = format;
        }
        parseMetadataContents(content);
        return '¨M';
      });

      text = text.replace(/¨M/g, '');

      text = globals.converter._dispatch('metadata.after', text, options, globals);
      return text;
    });

    /**
     * Remove one level of line-leading tabs or spaces
     */
    showdown.subParser('outdent', function (text, options, globals) {
      text = globals.converter._dispatch('outdent.before', text, options, globals);

      // attacklab: hack around Konqueror 3.5.4 bug:
      // "----------bug".replace(/^-/g,"") == "bug"
      text = text.replace(/^(\t|[ ]{1,4})/gm, '¨0'); // attacklab: g_tab_width

      // attacklab: clean up hack
      text = text.replace(/¨0/g, '');

      text = globals.converter._dispatch('outdent.after', text, options, globals);
      return text;
    });

    /**
     *
     */
    showdown.subParser('paragraphs', function (text, options, globals) {

      text = globals.converter._dispatch('paragraphs.before', text, options, globals);
      // Strip leading and trailing lines:
      text = text.replace(/^\n+/g, '');
      text = text.replace(/\n+$/g, '');

      var grafs = text.split(/\n{2,}/g),
          grafsOut = [],
          end = grafs.length; // Wrap <p> tags

      for (var i = 0; i < end; i++) {
        var str = grafs[i];
        // if this is an HTML marker, copy it
        if (str.search(/¨(K|G)(\d+)\1/g) >= 0) {
          grafsOut.push(str);

        // test for presence of characters to prevent empty lines being parsed
        // as paragraphs (resulting in undesired extra empty paragraphs)
        } else if (str.search(/\S/) >= 0) {
          str = showdown.subParser('spanGamut')(str, options, globals);
          str = str.replace(/^([ \t]*)/g, '<p>');
          str += '</p>';
          grafsOut.push(str);
        }
      }

      /** Unhashify HTML blocks */
      end = grafsOut.length;
      for (i = 0; i < end; i++) {
        var blockText = '',
            grafsOutIt = grafsOut[i],
            codeFlag = false;
        // if this is a marker for an html block...
        // use RegExp.test instead of string.search because of QML bug
        while (/¨(K|G)(\d+)\1/.test(grafsOutIt)) {
          var delim = RegExp.$1,
              num   = RegExp.$2;

          if (delim === 'K') {
            blockText = globals.gHtmlBlocks[num];
          } else {
            // we need to check if ghBlock is a false positive
            if (codeFlag) {
              // use encoded version of all text
              blockText = showdown.subParser('encodeCode')(globals.ghCodeBlocks[num].text, options, globals);
            } else {
              blockText = globals.ghCodeBlocks[num].codeblock;
            }
          }
          blockText = blockText.replace(/\$/g, '$$$$'); // Escape any dollar signs

          grafsOutIt = grafsOutIt.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/, blockText);
          // Check if grafsOutIt is a pre->code
          if (/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(grafsOutIt)) {
            codeFlag = true;
          }
        }
        grafsOut[i] = grafsOutIt;
      }
      text = grafsOut.join('\n');
      // Strip leading and trailing lines:
      text = text.replace(/^\n+/g, '');
      text = text.replace(/\n+$/g, '');
      return globals.converter._dispatch('paragraphs.after', text, options, globals);
    });

    /**
     * Run extension
     */
    showdown.subParser('runExtension', function (ext, text, options, globals) {

      if (ext.filter) {
        text = ext.filter(text, globals.converter, options);

      } else if (ext.regex) {
        // TODO remove this when old extension loading mechanism is deprecated
        var re = ext.regex;
        if (!(re instanceof RegExp)) {
          re = new RegExp(re, 'g');
        }
        text = text.replace(re, ext.replace);
      }

      return text;
    });

    /**
     * These are all the transformations that occur *within* block-level
     * tags like paragraphs, headers, and list items.
     */
    showdown.subParser('spanGamut', function (text, options, globals) {

      text = globals.converter._dispatch('spanGamut.before', text, options, globals);
      text = showdown.subParser('codeSpans')(text, options, globals);
      text = showdown.subParser('escapeSpecialCharsWithinTagAttributes')(text, options, globals);
      text = showdown.subParser('encodeBackslashEscapes')(text, options, globals);

      // Process anchor and image tags. Images must come first,
      // because ![foo][f] looks like an anchor.
      text = showdown.subParser('images')(text, options, globals);
      text = showdown.subParser('anchors')(text, options, globals);

      // Make links out of things like `<http://example.com/>`
      // Must come after anchors, because you can use < and >
      // delimiters in inline links like [this](<url>).
      text = showdown.subParser('autoLinks')(text, options, globals);
      text = showdown.subParser('simplifiedAutoLinks')(text, options, globals);
      text = showdown.subParser('emoji')(text, options, globals);
      text = showdown.subParser('underline')(text, options, globals);
      text = showdown.subParser('italicsAndBold')(text, options, globals);
      text = showdown.subParser('strikethrough')(text, options, globals);
      text = showdown.subParser('ellipsis')(text, options, globals);

      // we need to hash HTML tags inside spans
      text = showdown.subParser('hashHTMLSpans')(text, options, globals);

      // now we encode amps and angles
      text = showdown.subParser('encodeAmpsAndAngles')(text, options, globals);

      // Do hard breaks
      if (options.simpleLineBreaks) {
        // GFM style hard breaks
        // only add line breaks if the text does not contain a block (special case for lists)
        if (!/\n\n¨K/.test(text)) {
          text = text.replace(/\n+/g, '<br />\n');
        }
      } else {
        // Vanilla hard breaks
        text = text.replace(/  +\n/g, '<br />\n');
      }

      text = globals.converter._dispatch('spanGamut.after', text, options, globals);
      return text;
    });

    showdown.subParser('strikethrough', function (text, options, globals) {

      function parseInside (txt) {
        if (options.simplifiedAutoLink) {
          txt = showdown.subParser('simplifiedAutoLinks')(txt, options, globals);
        }
        return '<del>' + txt + '</del>';
      }

      if (options.strikethrough) {
        text = globals.converter._dispatch('strikethrough.before', text, options, globals);
        text = text.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, function (wm, txt) { return parseInside(txt); });
        text = globals.converter._dispatch('strikethrough.after', text, options, globals);
      }

      return text;
    });

    /**
     * Strips link definitions from text, stores the URLs and titles in
     * hash references.
     * Link defs are in the form: ^[id]: url "optional title"
     */
    showdown.subParser('stripLinkDefinitions', function (text, options, globals) {

      var regex       = /^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm,
          base64Regex = /^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;

      // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
      text += '¨0';

      var replaceFunc = function (wholeMatch, linkId, url, width, height, blankLines, title) {
        linkId = linkId.toLowerCase();
        if (url.match(/^data:.+?\/.+?;base64,/)) {
          // remove newlines
          globals.gUrls[linkId] = url.replace(/\s/g, '');
        } else {
          globals.gUrls[linkId] = showdown.subParser('encodeAmpsAndAngles')(url, options, globals);  // Link IDs are case-insensitive
        }

        if (blankLines) {
          // Oops, found blank lines, so it's not a title.
          // Put back the parenthetical statement we stole.
          return blankLines + title;

        } else {
          if (title) {
            globals.gTitles[linkId] = title.replace(/"|'/g, '&quot;');
          }
          if (options.parseImgDimensions && width && height) {
            globals.gDimensions[linkId] = {
              width:  width,
              height: height
            };
          }
        }
        // Completely remove the definition from the text
        return '';
      };

      // first we try to find base64 link references
      text = text.replace(base64Regex, replaceFunc);

      text = text.replace(regex, replaceFunc);

      // attacklab: strip sentinel
      text = text.replace(/¨0/, '');

      return text;
    });

    showdown.subParser('tables', function (text, options, globals) {

      if (!options.tables) {
        return text;
      }

      var tableRgx       = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm,
          //singeColTblRgx = /^ {0,3}\|.+\|\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n(?: {0,3}\|.+\|\n)+(?:\n\n|¨0)/gm;
          singeColTblRgx = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;

      function parseStyles (sLine) {
        if (/^:[ \t]*--*$/.test(sLine)) {
          return ' style="text-align:left;"';
        } else if (/^--*[ \t]*:[ \t]*$/.test(sLine)) {
          return ' style="text-align:right;"';
        } else if (/^:[ \t]*--*[ \t]*:$/.test(sLine)) {
          return ' style="text-align:center;"';
        } else {
          return '';
        }
      }

      function parseHeaders (header, style) {
        var id = '';
        header = header.trim();
        // support both tablesHeaderId and tableHeaderId due to error in documentation so we don't break backwards compatibility
        if (options.tablesHeaderId || options.tableHeaderId) {
          id = ' id="' + header.replace(/ /g, '_').toLowerCase() + '"';
        }
        header = showdown.subParser('spanGamut')(header, options, globals);

        return '<th' + id + style + '>' + header + '</th>\n';
      }

      function parseCells (cell, style) {
        var subText = showdown.subParser('spanGamut')(cell, options, globals);
        return '<td' + style + '>' + subText + '</td>\n';
      }

      function buildTable (headers, cells) {
        var tb = '<table>\n<thead>\n<tr>\n',
            tblLgn = headers.length;

        for (var i = 0; i < tblLgn; ++i) {
          tb += headers[i];
        }
        tb += '</tr>\n</thead>\n<tbody>\n';

        for (i = 0; i < cells.length; ++i) {
          tb += '<tr>\n';
          for (var ii = 0; ii < tblLgn; ++ii) {
            tb += cells[i][ii];
          }
          tb += '</tr>\n';
        }
        tb += '</tbody>\n</table>\n';
        return tb;
      }

      function parseTable (rawTable) {
        var i, tableLines = rawTable.split('\n');

        for (i = 0; i < tableLines.length; ++i) {
          // strip wrong first and last column if wrapped tables are used
          if (/^ {0,3}\|/.test(tableLines[i])) {
            tableLines[i] = tableLines[i].replace(/^ {0,3}\|/, '');
          }
          if (/\|[ \t]*$/.test(tableLines[i])) {
            tableLines[i] = tableLines[i].replace(/\|[ \t]*$/, '');
          }
          // parse code spans first, but we only support one line code spans
          tableLines[i] = showdown.subParser('codeSpans')(tableLines[i], options, globals);
        }

        var rawHeaders = tableLines[0].split('|').map(function (s) { return s.trim();}),
            rawStyles = tableLines[1].split('|').map(function (s) { return s.trim();}),
            rawCells = [],
            headers = [],
            styles = [],
            cells = [];

        tableLines.shift();
        tableLines.shift();

        for (i = 0; i < tableLines.length; ++i) {
          if (tableLines[i].trim() === '') {
            continue;
          }
          rawCells.push(
            tableLines[i]
              .split('|')
              .map(function (s) {
                return s.trim();
              })
          );
        }

        if (rawHeaders.length < rawStyles.length) {
          return rawTable;
        }

        for (i = 0; i < rawStyles.length; ++i) {
          styles.push(parseStyles(rawStyles[i]));
        }

        for (i = 0; i < rawHeaders.length; ++i) {
          if (showdown.helper.isUndefined(styles[i])) {
            styles[i] = '';
          }
          headers.push(parseHeaders(rawHeaders[i], styles[i]));
        }

        for (i = 0; i < rawCells.length; ++i) {
          var row = [];
          for (var ii = 0; ii < headers.length; ++ii) {
            if (showdown.helper.isUndefined(rawCells[i][ii])) ;
            row.push(parseCells(rawCells[i][ii], styles[ii]));
          }
          cells.push(row);
        }

        return buildTable(headers, cells);
      }

      text = globals.converter._dispatch('tables.before', text, options, globals);

      // find escaped pipe characters
      text = text.replace(/\\(\|)/g, showdown.helper.escapeCharactersCallback);

      // parse multi column tables
      text = text.replace(tableRgx, parseTable);

      // parse one column tables
      text = text.replace(singeColTblRgx, parseTable);

      text = globals.converter._dispatch('tables.after', text, options, globals);

      return text;
    });

    showdown.subParser('underline', function (text, options, globals) {

      if (!options.underline) {
        return text;
      }

      text = globals.converter._dispatch('underline.before', text, options, globals);

      if (options.literalMidWordUnderscores) {
        text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
          return '<u>' + txt + '</u>';
        });
        text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
          return '<u>' + txt + '</u>';
        });
      } else {
        text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
          return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
        });
        text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
          return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
        });
      }

      // escape remaining underscores to prevent them being parsed by italic and bold
      text = text.replace(/(_)/g, showdown.helper.escapeCharactersCallback);

      text = globals.converter._dispatch('underline.after', text, options, globals);

      return text;
    });

    /**
     * Swap back in all the special characters we've hidden.
     */
    showdown.subParser('unescapeSpecialChars', function (text, options, globals) {
      text = globals.converter._dispatch('unescapeSpecialChars.before', text, options, globals);

      text = text.replace(/¨E(\d+)E/g, function (wholeMatch, m1) {
        var charCodeToReplace = parseInt(m1);
        return String.fromCharCode(charCodeToReplace);
      });

      text = globals.converter._dispatch('unescapeSpecialChars.after', text, options, globals);
      return text;
    });

    showdown.subParser('makeMarkdown.blockquote', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        var children = node.childNodes,
            childrenLength = children.length;

        for (var i = 0; i < childrenLength; ++i) {
          var innerTxt = showdown.subParser('makeMarkdown.node')(children[i], globals);

          if (innerTxt === '') {
            continue;
          }
          txt += innerTxt;
        }
      }
      // cleanup
      txt = txt.trim();
      txt = '> ' + txt.split('\n').join('\n> ');
      return txt;
    });

    showdown.subParser('makeMarkdown.codeBlock', function (node, globals) {

      var lang = node.getAttribute('language'),
          num  = node.getAttribute('precodenum');
      return '```' + lang + '\n' + globals.preList[num] + '\n```';
    });

    showdown.subParser('makeMarkdown.codeSpan', function (node) {

      return '`' + node.innerHTML + '`';
    });

    showdown.subParser('makeMarkdown.emphasis', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        txt += '*';
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
        txt += '*';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.header', function (node, globals, headerLevel) {

      var headerMark = new Array(headerLevel + 1).join('#'),
          txt = '';

      if (node.hasChildNodes()) {
        txt = headerMark + ' ';
        var children = node.childNodes,
            childrenLength = children.length;

        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.hr', function () {

      return '---';
    });

    showdown.subParser('makeMarkdown.image', function (node) {

      var txt = '';
      if (node.hasAttribute('src')) {
        txt += '![' + node.getAttribute('alt') + '](';
        txt += '<' + node.getAttribute('src') + '>';
        if (node.hasAttribute('width') && node.hasAttribute('height')) {
          txt += ' =' + node.getAttribute('width') + 'x' + node.getAttribute('height');
        }

        if (node.hasAttribute('title')) {
          txt += ' "' + node.getAttribute('title') + '"';
        }
        txt += ')';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.links', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes() && node.hasAttribute('href')) {
        var children = node.childNodes,
            childrenLength = children.length;
        txt = '[';
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
        txt += '](';
        txt += '<' + node.getAttribute('href') + '>';
        if (node.hasAttribute('title')) {
          txt += ' "' + node.getAttribute('title') + '"';
        }
        txt += ')';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.list', function (node, globals, type) {

      var txt = '';
      if (!node.hasChildNodes()) {
        return '';
      }
      var listItems       = node.childNodes,
          listItemsLenght = listItems.length,
          listNum = node.getAttribute('start') || 1;

      for (var i = 0; i < listItemsLenght; ++i) {
        if (typeof listItems[i].tagName === 'undefined' || listItems[i].tagName.toLowerCase() !== 'li') {
          continue;
        }

        // define the bullet to use in list
        var bullet = '';
        if (type === 'ol') {
          bullet = listNum.toString() + '. ';
        } else {
          bullet = '- ';
        }

        // parse list item
        txt += bullet + showdown.subParser('makeMarkdown.listItem')(listItems[i], globals);
        ++listNum;
      }

      // add comment at the end to prevent consecutive lists to be parsed as one
      txt += '\n<!-- -->\n';
      return txt.trim();
    });

    showdown.subParser('makeMarkdown.listItem', function (node, globals) {

      var listItemTxt = '';

      var children = node.childNodes,
          childrenLenght = children.length;

      for (var i = 0; i < childrenLenght; ++i) {
        listItemTxt += showdown.subParser('makeMarkdown.node')(children[i], globals);
      }
      // if it's only one liner, we need to add a newline at the end
      if (!/\n$/.test(listItemTxt)) {
        listItemTxt += '\n';
      } else {
        // it's multiparagraph, so we need to indent
        listItemTxt = listItemTxt
          .split('\n')
          .join('\n    ')
          .replace(/^ {4}$/gm, '')
          .replace(/\n\n+/g, '\n\n');
      }

      return listItemTxt;
    });



    showdown.subParser('makeMarkdown.node', function (node, globals, spansOnly) {

      spansOnly = spansOnly || false;

      var txt = '';

      // edge case of text without wrapper paragraph
      if (node.nodeType === 3) {
        return showdown.subParser('makeMarkdown.txt')(node, globals);
      }

      // HTML comment
      if (node.nodeType === 8) {
        return '<!--' + node.data + '-->\n\n';
      }

      // process only node elements
      if (node.nodeType !== 1) {
        return '';
      }

      var tagName = node.tagName.toLowerCase();

      switch (tagName) {

        //
        // BLOCKS
        //
        case 'h1':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 1) + '\n\n'; }
          break;
        case 'h2':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 2) + '\n\n'; }
          break;
        case 'h3':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 3) + '\n\n'; }
          break;
        case 'h4':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 4) + '\n\n'; }
          break;
        case 'h5':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 5) + '\n\n'; }
          break;
        case 'h6':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 6) + '\n\n'; }
          break;

        case 'p':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.paragraph')(node, globals) + '\n\n'; }
          break;

        case 'blockquote':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.blockquote')(node, globals) + '\n\n'; }
          break;

        case 'hr':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.hr')(node, globals) + '\n\n'; }
          break;

        case 'ol':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, globals, 'ol') + '\n\n'; }
          break;

        case 'ul':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, globals, 'ul') + '\n\n'; }
          break;

        case 'precode':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.codeBlock')(node, globals) + '\n\n'; }
          break;

        case 'pre':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.pre')(node, globals) + '\n\n'; }
          break;

        case 'table':
          if (!spansOnly) { txt = showdown.subParser('makeMarkdown.table')(node, globals) + '\n\n'; }
          break;

        //
        // SPANS
        //
        case 'code':
          txt = showdown.subParser('makeMarkdown.codeSpan')(node, globals);
          break;

        case 'em':
        case 'i':
          txt = showdown.subParser('makeMarkdown.emphasis')(node, globals);
          break;

        case 'strong':
        case 'b':
          txt = showdown.subParser('makeMarkdown.strong')(node, globals);
          break;

        case 'del':
          txt = showdown.subParser('makeMarkdown.strikethrough')(node, globals);
          break;

        case 'a':
          txt = showdown.subParser('makeMarkdown.links')(node, globals);
          break;

        case 'img':
          txt = showdown.subParser('makeMarkdown.image')(node, globals);
          break;

        default:
          txt = node.outerHTML + '\n\n';
      }

      // common normalization
      // TODO eventually

      return txt;
    });

    showdown.subParser('makeMarkdown.paragraph', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
      }

      // some text normalization
      txt = txt.trim();

      return txt;
    });

    showdown.subParser('makeMarkdown.pre', function (node, globals) {

      var num  = node.getAttribute('prenum');
      return '<pre>' + globals.preList[num] + '</pre>';
    });

    showdown.subParser('makeMarkdown.strikethrough', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        txt += '~~';
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
        txt += '~~';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.strong', function (node, globals) {

      var txt = '';
      if (node.hasChildNodes()) {
        txt += '**';
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
          txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
        }
        txt += '**';
      }
      return txt;
    });

    showdown.subParser('makeMarkdown.table', function (node, globals) {

      var txt = '',
          tableArray = [[], []],
          headings   = node.querySelectorAll('thead>tr>th'),
          rows       = node.querySelectorAll('tbody>tr'),
          i, ii;
      for (i = 0; i < headings.length; ++i) {
        var headContent = showdown.subParser('makeMarkdown.tableCell')(headings[i], globals),
            allign = '---';

        if (headings[i].hasAttribute('style')) {
          var style = headings[i].getAttribute('style').toLowerCase().replace(/\s/g, '');
          switch (style) {
            case 'text-align:left;':
              allign = ':---';
              break;
            case 'text-align:right;':
              allign = '---:';
              break;
            case 'text-align:center;':
              allign = ':---:';
              break;
          }
        }
        tableArray[0][i] = headContent.trim();
        tableArray[1][i] = allign;
      }

      for (i = 0; i < rows.length; ++i) {
        var r = tableArray.push([]) - 1,
            cols = rows[i].getElementsByTagName('td');

        for (ii = 0; ii < headings.length; ++ii) {
          var cellContent = ' ';
          if (typeof cols[ii] !== 'undefined') {
            cellContent = showdown.subParser('makeMarkdown.tableCell')(cols[ii], globals);
          }
          tableArray[r].push(cellContent);
        }
      }

      var cellSpacesCount = 3;
      for (i = 0; i < tableArray.length; ++i) {
        for (ii = 0; ii < tableArray[i].length; ++ii) {
          var strLen = tableArray[i][ii].length;
          if (strLen > cellSpacesCount) {
            cellSpacesCount = strLen;
          }
        }
      }

      for (i = 0; i < tableArray.length; ++i) {
        for (ii = 0; ii < tableArray[i].length; ++ii) {
          if (i === 1) {
            if (tableArray[i][ii].slice(-1) === ':') {
              tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii].slice(-1), cellSpacesCount - 1, '-') + ':';
            } else {
              tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount, '-');
            }
          } else {
            tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount);
          }
        }
        txt += '| ' + tableArray[i].join(' | ') + ' |\n';
      }

      return txt.trim();
    });

    showdown.subParser('makeMarkdown.tableCell', function (node, globals) {

      var txt = '';
      if (!node.hasChildNodes()) {
        return '';
      }
      var children = node.childNodes,
          childrenLength = children.length;

      for (var i = 0; i < childrenLength; ++i) {
        txt += showdown.subParser('makeMarkdown.node')(children[i], globals, true);
      }
      return txt.trim();
    });

    showdown.subParser('makeMarkdown.txt', function (node) {

      var txt = node.nodeValue;

      // multiple spaces are collapsed
      txt = txt.replace(/ +/g, ' ');

      // replace the custom ¨NBSP; with a space
      txt = txt.replace(/¨NBSP;/g, ' ');

      // ", <, > and & should replace escaped html entities
      txt = showdown.helper.unescapeHTMLEntities(txt);

      // escape markdown magic characters
      // emphasis, strong and strikethrough - can appear everywhere
      // we also escape pipe (|) because of tables
      // and escape ` because of code blocks and spans
      txt = txt.replace(/([*_~|`])/g, '\\$1');

      // escape > because of blockquotes
      txt = txt.replace(/^(\s*)>/g, '\\$1>');

      // hash character, only troublesome at the beginning of a line because of headers
      txt = txt.replace(/^#/gm, '\\#');

      // horizontal rules
      txt = txt.replace(/^(\s*)([-=]{3,})(\s*)$/, '$1\\$2$3');

      // dot, because of ordered lists, only troublesome at the beginning of a line when preceded by an integer
      txt = txt.replace(/^( {0,3}\d+)\./gm, '$1\\.');

      // +, * and -, at the beginning of a line becomes a list, so we need to escape them also (asterisk was already escaped)
      txt = txt.replace(/^( {0,3})([+-])/gm, '$1\\$2');

      // images and links, ] followed by ( is problematic, so we escape it
      txt = txt.replace(/]([\s]*)\(/g, '\\]$1\\(');

      // reference URIs must also be escaped
      txt = txt.replace(/^ {0,3}\[([\S \t]*?)]:/gm, '\\[$1]:');

      return txt;
    });

    var root = this;

    // AMD Loader
    if ( module.exports) {
      module.exports = showdown;

    // Regular Browser loader
    } else {
      root.showdown = showdown;
    }
    }).call(commonjsGlobal);


    });

    var clipboard = createCommonjsModule(function (module, exports) {
    /*!
     * clipboard.js v2.0.8
     * https://clipboardjs.com/
     *
     * Licensed MIT © Zeno Rocha
     */
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory();
    })(commonjsGlobal, function() {
    return /******/ (function() { // webpackBootstrap
    /******/ 	var __webpack_modules__ = ({

    /***/ 134:
    /***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

    // EXPORTS
    __webpack_require__.d(__webpack_exports__, {
      "default": function() { return /* binding */ clipboard; }
    });

    // EXTERNAL MODULE: ./node_modules/tiny-emitter/index.js
    var tiny_emitter = __webpack_require__(279);
    var tiny_emitter_default = /*#__PURE__*/__webpack_require__.n(tiny_emitter);
    // EXTERNAL MODULE: ./node_modules/good-listener/src/listen.js
    var listen = __webpack_require__(370);
    var listen_default = /*#__PURE__*/__webpack_require__.n(listen);
    // EXTERNAL MODULE: ./node_modules/select/src/select.js
    var src_select = __webpack_require__(817);
    var select_default = /*#__PURE__*/__webpack_require__.n(src_select);
    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


    /**
     * Inner class which performs selection from either `text` or `target`
     * properties and then executes copy or cut operations.
     */

    var ClipboardAction = /*#__PURE__*/function () {
      /**
       * @param {Object} options
       */
      function ClipboardAction(options) {
        _classCallCheck(this, ClipboardAction);

        this.resolveOptions(options);
        this.initSelection();
      }
      /**
       * Defines base properties passed from constructor.
       * @param {Object} options
       */


      _createClass(ClipboardAction, [{
        key: "resolveOptions",
        value: function resolveOptions() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          this.action = options.action;
          this.container = options.container;
          this.emitter = options.emitter;
          this.target = options.target;
          this.text = options.text;
          this.trigger = options.trigger;
          this.selectedText = '';
        }
        /**
         * Decides which selection strategy is going to be applied based
         * on the existence of `text` and `target` properties.
         */

      }, {
        key: "initSelection",
        value: function initSelection() {
          if (this.text) {
            this.selectFake();
          } else if (this.target) {
            this.selectTarget();
          }
        }
        /**
         * Creates a fake textarea element, sets its value from `text` property,
         */

      }, {
        key: "createFakeElement",
        value: function createFakeElement() {
          var isRTL = document.documentElement.getAttribute('dir') === 'rtl';
          this.fakeElem = document.createElement('textarea'); // Prevent zooming on iOS

          this.fakeElem.style.fontSize = '12pt'; // Reset box model

          this.fakeElem.style.border = '0';
          this.fakeElem.style.padding = '0';
          this.fakeElem.style.margin = '0'; // Move element out of screen horizontally

          this.fakeElem.style.position = 'absolute';
          this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px'; // Move element to the same position vertically

          var yPosition = window.pageYOffset || document.documentElement.scrollTop;
          this.fakeElem.style.top = "".concat(yPosition, "px");
          this.fakeElem.setAttribute('readonly', '');
          this.fakeElem.value = this.text;
          return this.fakeElem;
        }
        /**
         * Get's the value of fakeElem,
         * and makes a selection on it.
         */

      }, {
        key: "selectFake",
        value: function selectFake() {
          var _this = this;

          var fakeElem = this.createFakeElement();

          this.fakeHandlerCallback = function () {
            return _this.removeFake();
          };

          this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;
          this.container.appendChild(fakeElem);
          this.selectedText = select_default()(fakeElem);
          this.copyText();
          this.removeFake();
        }
        /**
         * Only removes the fake element after another click event, that way
         * a user can hit `Ctrl+C` to copy because selection still exists.
         */

      }, {
        key: "removeFake",
        value: function removeFake() {
          if (this.fakeHandler) {
            this.container.removeEventListener('click', this.fakeHandlerCallback);
            this.fakeHandler = null;
            this.fakeHandlerCallback = null;
          }

          if (this.fakeElem) {
            this.container.removeChild(this.fakeElem);
            this.fakeElem = null;
          }
        }
        /**
         * Selects the content from element passed on `target` property.
         */

      }, {
        key: "selectTarget",
        value: function selectTarget() {
          this.selectedText = select_default()(this.target);
          this.copyText();
        }
        /**
         * Executes the copy operation based on the current selection.
         */

      }, {
        key: "copyText",
        value: function copyText() {
          var succeeded;

          try {
            succeeded = document.execCommand(this.action);
          } catch (err) {
            succeeded = false;
          }

          this.handleResult(succeeded);
        }
        /**
         * Fires an event based on the copy operation result.
         * @param {Boolean} succeeded
         */

      }, {
        key: "handleResult",
        value: function handleResult(succeeded) {
          this.emitter.emit(succeeded ? 'success' : 'error', {
            action: this.action,
            text: this.selectedText,
            trigger: this.trigger,
            clearSelection: this.clearSelection.bind(this)
          });
        }
        /**
         * Moves focus away from `target` and back to the trigger, removes current selection.
         */

      }, {
        key: "clearSelection",
        value: function clearSelection() {
          if (this.trigger) {
            this.trigger.focus();
          }

          document.activeElement.blur();
          window.getSelection().removeAllRanges();
        }
        /**
         * Sets the `action` to be performed which can be either 'copy' or 'cut'.
         * @param {String} action
         */

      }, {
        key: "destroy",

        /**
         * Destroy lifecycle.
         */
        value: function destroy() {
          this.removeFake();
        }
      }, {
        key: "action",
        set: function set() {
          var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';
          this._action = action;

          if (this._action !== 'copy' && this._action !== 'cut') {
            throw new Error('Invalid "action" value, use either "copy" or "cut"');
          }
        }
        /**
         * Gets the `action` property.
         * @return {String}
         */
        ,
        get: function get() {
          return this._action;
        }
        /**
         * Sets the `target` property using an element
         * that will be have its content copied.
         * @param {Element} target
         */

      }, {
        key: "target",
        set: function set(target) {
          if (target !== undefined) {
            if (target && _typeof(target) === 'object' && target.nodeType === 1) {
              if (this.action === 'copy' && target.hasAttribute('disabled')) {
                throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
              }

              if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
              }

              this._target = target;
            } else {
              throw new Error('Invalid "target" value, use a valid Element');
            }
          }
        }
        /**
         * Gets the `target` property.
         * @return {String|HTMLElement}
         */
        ,
        get: function get() {
          return this._target;
        }
      }]);

      return ClipboardAction;
    }();

    /* harmony default export */ var clipboard_action = (ClipboardAction);
    function clipboard_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { clipboard_typeof = function _typeof(obj) { return typeof obj; }; } else { clipboard_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return clipboard_typeof(obj); }

    function clipboard_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function clipboard_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function clipboard_createClass(Constructor, protoProps, staticProps) { if (protoProps) clipboard_defineProperties(Constructor.prototype, protoProps); if (staticProps) clipboard_defineProperties(Constructor, staticProps); return Constructor; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (clipboard_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }




    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */

    function getAttributeValue(suffix, element) {
      var attribute = "data-clipboard-".concat(suffix);

      if (!element.hasAttribute(attribute)) {
        return;
      }

      return element.getAttribute(attribute);
    }
    /**
     * Base class which takes one or more elements, adds event listeners to them,
     * and instantiates a new `ClipboardAction` on each click.
     */


    var Clipboard = /*#__PURE__*/function (_Emitter) {
      _inherits(Clipboard, _Emitter);

      var _super = _createSuper(Clipboard);

      /**
       * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
       * @param {Object} options
       */
      function Clipboard(trigger, options) {
        var _this;

        clipboard_classCallCheck(this, Clipboard);

        _this = _super.call(this);

        _this.resolveOptions(options);

        _this.listenClick(trigger);

        return _this;
      }
      /**
       * Defines if attributes would be resolved using internal setter functions
       * or custom functions that were passed in the constructor.
       * @param {Object} options
       */


      clipboard_createClass(Clipboard, [{
        key: "resolveOptions",
        value: function resolveOptions() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
          this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
          this.text = typeof options.text === 'function' ? options.text : this.defaultText;
          this.container = clipboard_typeof(options.container) === 'object' ? options.container : document.body;
        }
        /**
         * Adds a click event listener to the passed trigger.
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         */

      }, {
        key: "listenClick",
        value: function listenClick(trigger) {
          var _this2 = this;

          this.listener = listen_default()(trigger, 'click', function (e) {
            return _this2.onClick(e);
          });
        }
        /**
         * Defines a new `ClipboardAction` on each click event.
         * @param {Event} e
         */

      }, {
        key: "onClick",
        value: function onClick(e) {
          var trigger = e.delegateTarget || e.currentTarget;

          if (this.clipboardAction) {
            this.clipboardAction = null;
          }

          this.clipboardAction = new clipboard_action({
            action: this.action(trigger),
            target: this.target(trigger),
            text: this.text(trigger),
            container: this.container,
            trigger: trigger,
            emitter: this
          });
        }
        /**
         * Default `action` lookup function.
         * @param {Element} trigger
         */

      }, {
        key: "defaultAction",
        value: function defaultAction(trigger) {
          return getAttributeValue('action', trigger);
        }
        /**
         * Default `target` lookup function.
         * @param {Element} trigger
         */

      }, {
        key: "defaultTarget",
        value: function defaultTarget(trigger) {
          var selector = getAttributeValue('target', trigger);

          if (selector) {
            return document.querySelector(selector);
          }
        }
        /**
         * Returns the support of the given action, or all actions if no action is
         * given.
         * @param {String} [action]
         */

      }, {
        key: "defaultText",

        /**
         * Default `text` lookup function.
         * @param {Element} trigger
         */
        value: function defaultText(trigger) {
          return getAttributeValue('text', trigger);
        }
        /**
         * Destroy lifecycle.
         */

      }, {
        key: "destroy",
        value: function destroy() {
          this.listener.destroy();

          if (this.clipboardAction) {
            this.clipboardAction.destroy();
            this.clipboardAction = null;
          }
        }
      }], [{
        key: "isSupported",
        value: function isSupported() {
          var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];
          var actions = typeof action === 'string' ? [action] : action;
          var support = !!document.queryCommandSupported;
          actions.forEach(function (action) {
            support = support && !!document.queryCommandSupported(action);
          });
          return support;
        }
      }]);

      return Clipboard;
    }((tiny_emitter_default()));

    /* harmony default export */ var clipboard = (Clipboard);

    /***/ }),

    /***/ 828:
    /***/ (function(module) {

    var DOCUMENT_NODE_TYPE = 9;

    /**
     * A polyfill for Element.matches()
     */
    if (typeof Element !== 'undefined' && !Element.prototype.matches) {
        var proto = Element.prototype;

        proto.matches = proto.matchesSelector ||
                        proto.mozMatchesSelector ||
                        proto.msMatchesSelector ||
                        proto.oMatchesSelector ||
                        proto.webkitMatchesSelector;
    }

    /**
     * Finds the closest parent that matches a selector.
     *
     * @param {Element} element
     * @param {String} selector
     * @return {Function}
     */
    function closest (element, selector) {
        while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
            if (typeof element.matches === 'function' &&
                element.matches(selector)) {
              return element;
            }
            element = element.parentNode;
        }
    }

    module.exports = closest;


    /***/ }),

    /***/ 438:
    /***/ (function(module, __unused_webpack_exports, __webpack_require__) {

    var closest = __webpack_require__(828);

    /**
     * Delegates event to a selector.
     *
     * @param {Element} element
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @param {Boolean} useCapture
     * @return {Object}
     */
    function _delegate(element, selector, type, callback, useCapture) {
        var listenerFn = listener.apply(this, arguments);

        element.addEventListener(type, listenerFn, useCapture);

        return {
            destroy: function() {
                element.removeEventListener(type, listenerFn, useCapture);
            }
        }
    }

    /**
     * Delegates event to a selector.
     *
     * @param {Element|String|Array} [elements]
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @param {Boolean} useCapture
     * @return {Object}
     */
    function delegate(elements, selector, type, callback, useCapture) {
        // Handle the regular Element usage
        if (typeof elements.addEventListener === 'function') {
            return _delegate.apply(null, arguments);
        }

        // Handle Element-less usage, it defaults to global delegation
        if (typeof type === 'function') {
            // Use `document` as the first parameter, then apply arguments
            // This is a short way to .unshift `arguments` without running into deoptimizations
            return _delegate.bind(null, document).apply(null, arguments);
        }

        // Handle Selector-based usage
        if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
        }

        // Handle Array-like based usage
        return Array.prototype.map.call(elements, function (element) {
            return _delegate(element, selector, type, callback, useCapture);
        });
    }

    /**
     * Finds closest match and invokes callback.
     *
     * @param {Element} element
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @return {Function}
     */
    function listener(element, selector, type, callback) {
        return function(e) {
            e.delegateTarget = closest(e.target, selector);

            if (e.delegateTarget) {
                callback.call(element, e);
            }
        }
    }

    module.exports = delegate;


    /***/ }),

    /***/ 879:
    /***/ (function(__unused_webpack_module, exports) {

    /**
     * Check if argument is a HTML element.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.node = function(value) {
        return value !== undefined
            && value instanceof HTMLElement
            && value.nodeType === 1;
    };

    /**
     * Check if argument is a list of HTML elements.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.nodeList = function(value) {
        var type = Object.prototype.toString.call(value);

        return value !== undefined
            && (type === '[object NodeList]' || type === '[object HTMLCollection]')
            && ('length' in value)
            && (value.length === 0 || exports.node(value[0]));
    };

    /**
     * Check if argument is a string.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.string = function(value) {
        return typeof value === 'string'
            || value instanceof String;
    };

    /**
     * Check if argument is a function.
     *
     * @param {Object} value
     * @return {Boolean}
     */
    exports.fn = function(value) {
        var type = Object.prototype.toString.call(value);

        return type === '[object Function]';
    };


    /***/ }),

    /***/ 370:
    /***/ (function(module, __unused_webpack_exports, __webpack_require__) {

    var is = __webpack_require__(879);
    var delegate = __webpack_require__(438);

    /**
     * Validates all params and calls the right
     * listener function based on its target type.
     *
     * @param {String|HTMLElement|HTMLCollection|NodeList} target
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listen(target, type, callback) {
        if (!target && !type && !callback) {
            throw new Error('Missing required arguments');
        }

        if (!is.string(type)) {
            throw new TypeError('Second argument must be a String');
        }

        if (!is.fn(callback)) {
            throw new TypeError('Third argument must be a Function');
        }

        if (is.node(target)) {
            return listenNode(target, type, callback);
        }
        else if (is.nodeList(target)) {
            return listenNodeList(target, type, callback);
        }
        else if (is.string(target)) {
            return listenSelector(target, type, callback);
        }
        else {
            throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
        }
    }

    /**
     * Adds an event listener to a HTML element
     * and returns a remove listener function.
     *
     * @param {HTMLElement} node
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenNode(node, type, callback) {
        node.addEventListener(type, callback);

        return {
            destroy: function() {
                node.removeEventListener(type, callback);
            }
        }
    }

    /**
     * Add an event listener to a list of HTML elements
     * and returns a remove listener function.
     *
     * @param {NodeList|HTMLCollection} nodeList
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenNodeList(nodeList, type, callback) {
        Array.prototype.forEach.call(nodeList, function(node) {
            node.addEventListener(type, callback);
        });

        return {
            destroy: function() {
                Array.prototype.forEach.call(nodeList, function(node) {
                    node.removeEventListener(type, callback);
                });
            }
        }
    }

    /**
     * Add an event listener to a selector
     * and returns a remove listener function.
     *
     * @param {String} selector
     * @param {String} type
     * @param {Function} callback
     * @return {Object}
     */
    function listenSelector(selector, type, callback) {
        return delegate(document.body, selector, type, callback);
    }

    module.exports = listen;


    /***/ }),

    /***/ 817:
    /***/ (function(module) {

    function select(element) {
        var selectedText;

        if (element.nodeName === 'SELECT') {
            element.focus();

            selectedText = element.value;
        }
        else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
            var isReadOnly = element.hasAttribute('readonly');

            if (!isReadOnly) {
                element.setAttribute('readonly', '');
            }

            element.select();
            element.setSelectionRange(0, element.value.length);

            if (!isReadOnly) {
                element.removeAttribute('readonly');
            }

            selectedText = element.value;
        }
        else {
            if (element.hasAttribute('contenteditable')) {
                element.focus();
            }

            var selection = window.getSelection();
            var range = document.createRange();

            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            selectedText = selection.toString();
        }

        return selectedText;
    }

    module.exports = select;


    /***/ }),

    /***/ 279:
    /***/ (function(module) {

    function E () {
      // Keep this empty so it's easier to inherit from
      // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
    }

    E.prototype = {
      on: function (name, callback, ctx) {
        var e = this.e || (this.e = {});

        (e[name] || (e[name] = [])).push({
          fn: callback,
          ctx: ctx
        });

        return this;
      },

      once: function (name, callback, ctx) {
        var self = this;
        function listener () {
          self.off(name, listener);
          callback.apply(ctx, arguments);
        }
        listener._ = callback;
        return this.on(name, listener, ctx);
      },

      emit: function (name) {
        var data = [].slice.call(arguments, 1);
        var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
        var i = 0;
        var len = evtArr.length;

        for (i; i < len; i++) {
          evtArr[i].fn.apply(evtArr[i].ctx, data);
        }

        return this;
      },

      off: function (name, callback) {
        var e = this.e || (this.e = {});
        var evts = e[name];
        var liveEvents = [];

        if (evts && callback) {
          for (var i = 0, len = evts.length; i < len; i++) {
            if (evts[i].fn !== callback && evts[i].fn._ !== callback)
              liveEvents.push(evts[i]);
          }
        }

        // Remove event from queue to prevent memory leak
        // Suggested by https://github.com/lazd
        // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

        (liveEvents.length)
          ? e[name] = liveEvents
          : delete e[name];

        return this;
      }
    };

    module.exports = E;
    module.exports.TinyEmitter = E;


    /***/ })

    /******/ 	});
    /************************************************************************/
    /******/ 	// The module cache
    /******/ 	var __webpack_module_cache__ = {};
    /******/ 	
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/ 		// Check if module is in cache
    /******/ 		if(__webpack_module_cache__[moduleId]) {
    /******/ 			return __webpack_module_cache__[moduleId].exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = __webpack_module_cache__[moduleId] = {
    /******/ 			// no module.id needed
    /******/ 			// no module.loaded needed
    /******/ 			exports: {}
    /******/ 		};
    /******/ 	
    /******/ 		// Execute the module function
    /******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    /******/ 	
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/ 	
    /************************************************************************/
    /******/ 	/* webpack/runtime/compat get default export */
    /******/ 	!function() {
    /******/ 		// getDefaultExport function for compatibility with non-harmony modules
    /******/ 		__webpack_require__.n = function(module) {
    /******/ 			var getter = module && module.__esModule ?
    /******/ 				function() { return module['default']; } :
    /******/ 				function() { return module; };
    /******/ 			__webpack_require__.d(getter, { a: getter });
    /******/ 			return getter;
    /******/ 		};
    /******/ 	}();
    /******/ 	
    /******/ 	/* webpack/runtime/define property getters */
    /******/ 	!function() {
    /******/ 		// define getter functions for harmony exports
    /******/ 		__webpack_require__.d = function(exports, definition) {
    /******/ 			for(var key in definition) {
    /******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
    /******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
    /******/ 				}
    /******/ 			}
    /******/ 		};
    /******/ 	}();
    /******/ 	
    /******/ 	/* webpack/runtime/hasOwnProperty shorthand */
    /******/ 	!function() {
    /******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };
    /******/ 	}();
    /******/ 	
    /************************************************************************/
    /******/ 	// module exports must be returned from runtime so entry inlining is disabled
    /******/ 	// startup
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(134);
    /******/ })()
    .default;
    });
    });

    var ClipboardJS = unwrapExports(clipboard);

    function formatEnv (variable) {
      if (!variable) return '';

      return variable.replace(
        /{{\s*(_.)?([a-zA-Z0-9_]+)\s*}}/g,
        '<span class="env-variable">$2</span>'
      );
    }

    function getBasicAuthHeader(username = null, password = null) {
      const header = `${username || ''}:${password || ''}`;
      const authString = btoa(header); // eslint-disable-line no-undef

      return {
        name: 'Authorization',
        value: `Basic ${authString}`
      };
    }

    function getBearerAuthHeader(token, prefix) {
      return {
        name: 'Authorization',
        value: `${prefix || 'Bearer'} ${token}`
      };
    }

    function getOAuth1Header(opts) {
      const {
        callback,
        consumerKey,
        nonce,
        signatureMethod,
        timestamp,
        tokenKey
      } = opts;

      const value = `OAuth oauth_callback="${callback}",
oauth_consumer_key="${consumerKey}",
oauth_nonce="${nonce || '{{oauth_nonce}}'}",
oauth_signature="{{oauth_signature}}",
oauth_signature_method="${signatureMethod}",
oauth_timestamp="${timestamp || 1103493600}",
oauth_token="${tokenKey}",
oauth_version="1.0"`.split('\n').join(' ');

      return {
        name: 'Authorization',
        value
      };
    }

    // WIP.

    function getOAuth2Header() {
      return {
        name: 'Authorization',
        value: 'OAuth {{params}}, oauth_version="2.0"'
      };
    }

    function getHawkAuthHeader(id) {
      return {
        name: 'Authorization',
        value: `Hawk id="${id}", ts="1103493600", nonce="{{hawk_nonce}}", mac="{{hawk_mac}}"`
      };
    }

    function getNTLMAuthHeader() {
      return {
        name: 'Authorization',
        value: 'NTLM {{ntlm_token}}'
      };
    }

    function getASAPHeader() {
      return {
        name: 'Authorization',
        value: 'Bearer {{jwt_token}}'
      };
    }

    function getDefaultAuthHeader() {
      return {
        name: 'Authorization',
        value: '{{authorization}}'
      };
    }

    function generateAuthHeader(auth) {
      switch (auth.type) {
        case 'basic':
          return getBasicAuthHeader(auth.username, auth.password);
        case 'bearer':
          return getBearerAuthHeader(auth.token, auth.prefix);
        case 'oauth1':
          return getOAuth1Header(auth);
        case 'oauth2':
          return getOAuth2Header();
        case 'hawk':
          return getHawkAuthHeader(auth.id);
        case 'ntlm':
          return getNTLMAuthHeader();
        case 'asap':
          return getASAPHeader();
        default:
          return getDefaultAuthHeader();
      }
    }

    class BodyParser {
      constructor(body) {
        this.body = body;
        this.mime = body.mimeType;
      }

      __parseJSON() {
        if (!this.body.text) {
          return;
        }

        this.body.text = this.body.text.replace(new RegExp('{{.*}}', 'g'), '"!!Missing declaration in environment!!"');
        let text;

        try {
          text = JSON.stringify(JSON.parse(this.body.text), null, 2);
        } catch (_) {
          console.warn('Failed to parse JSON body (expect incorrect tokenization):', this.body.text);
          text = this.body.text;
        }

        return {
          type: 'plain',
          note: 'json',
          text: `<pre>${text}</pre>`
        };
      }

      __parseMultipart() {
        const rows = this.body.params.map(p => {
          return {
            name: p.name,
            value: p.value,
            description: p.description
          };
        });

        return {
          type: 'array',
          note: 'formdata',
          rows
        };
      }

      __parsePlain() {
        return {
          type: 'plain',
          note: 'raw',
          text: `<pre>${this.body.text}</pre>`
        };
      }

      parse() {
        switch (this.mime) {
          case 'application/json':
            return this.__parseJSON();
          case 'multipart/form-data':
          case 'application/x-www-form-urlencoded':
            return this.__parseMultipart();
          default:
            return this.__parsePlain();
        }
      }
    }

    class ContentGenerator {
      constructor(req) {
        this.req = req;
      }

      params() {
        const rows = [];

        this.req.parameters.forEach(param => {
          rows.push({
            name: param.name,
            value: param.value,
            description: param.description
          });
        });

        return {
          title: 'Parameters',
          rows
        };
      }

      headers() {
        const rows = [];

        this.req.headers.forEach(header => {
          rows.push({
            name: header.name,
            value: formatEnv(header.value || ''),
            description: header.description
          });
        });

        if (this.req.authentication && this.req.authentication.type) {
          const authHeader = generateAuthHeader(this.req.authentication);

          rows.push({
            name: authHeader.name,
            value: `<pre>${formatEnv(authHeader.value)}</pre>`
          });
        }

        return {
          title: 'Headers',
          rows
        };
      }

      body() {
        const parser = new BodyParser(this.req.body);
        const data = parser.parse();

        switch (data.type) {
          case 'array':
            return {
              title: 'Body',
              note: data.note,
              rows: data.rows
            };
          case 'plain':
            return {
              title: 'Body',
              note: data.note,
              text: data.text
            };
        }
      }
    }

    function parseUrlWithParams(url, req) {
      const params = req.parameters;

      if (!params || !params.length) {
        return url;
      }

      url = `${url}?`;

      url += params.filter(param => !param.disabled).map(param => {
        return `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`;
      }).join('&');

      return url;
    }

    function escape$2 (str) {
      return JSON.stringify(str).slice(1, -1);
    }

    function curl(url, req) {
      let code = `curl "${parseUrlWithParams(url, req)}" \\\n`;

      req.headers.forEach(header => {
        code += `  -H '${header.name}: ${header.value || ''}' \\\n`;
      });

      if (req.authHeader) {
        code += `  -H '${req.authHeader.name}: ${escape$2(req.authHeader.value || '')}' \\\n`;
      }

      code += `  -X ${req.method} \\\n`;

      if (req.cookies && req.cookies.length) {
        req.cookies.forEach(cookie => {
          code += `  -b '${cookie.key}'='${cookie.value}' \\\n`;
        });
      }

      if (req.body && req.body.params && req.body.params.length) {
        req.body.params.forEach(param => {
          if (param.value === null) {
            return false;
          }

          if (param.value.indexOf('\'') >= 0 && param.value.indexOf('"') >= 0) {
            code += `  -F "${param.name}=${param.value.replace('"', '\\"')}"`;
          } else if (param.value.indexOf('\'') >= 0) {
            code += `  -F "${param.name}=${param.value}"`;
          } else if (param.value.indexOf('"') >= 0) {
            code += `  -F '${param.name}=${param.value}'`;
          } else {
            code += `  -F '${param.name}=${param.value}'`;
          }
          code += ' \\\n';
        });
      }

      if (req.body && req.body.text) {
        code += `  -d '${req.body.text.replace(/\t/g, '  ')}' \\\n`;
      }

      return code.slice(0, -2);
    }

    function parseBody(mime, body) {
      if (mime === 'application/json' && body.text) {
        return JSON.parse(body.text);
      }

      if (mime === 'application/x-www-form-urlencoded') {
        return body.params.map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`).join('&');
      }

      // xml to JS object conversion to be added

      return body.text;
    }

    function javascript$1(url, req) {
      let code = '';
      let hasForm = false;

      if (req.body && req.body.mimeType === 'multipart/form-data') {
        hasForm = true;

        code += 'const form = new FormData();\n';

        req.body.params.forEach(param => {
          code += `form.append("${param.name}", "${param.value}");\n`;
        });

        code += '\n';
      }

      code += `fetch("${parseUrlWithParams(url, req)}", `;

      const opts = {
        method: req.method
      };

      if (req.headers && req.headers.length) {
        opts.headers = {};

        req.headers.forEach(header => {
          opts.headers[header.name] = header.value;
        });
      }

      if (req.authHeader) {
        if (!opts.headers) {
          opts.headers = {};
        }

        opts.headers[req.authHeader.name] = req.authHeader.value;
      }

      if (req.cookies && req.cookies.length) {
        if (!opts.headers) {
          opts.headers = {};
        }

        opts.headers.cookie = req.cookies.map(cookie => `${encodeURIComponent(cookie.key)}=${encodeURIComponent(cookie.value)}`).join('; ');
      }

      if (!hasForm && req.body && req.body.mimeType !== 'multipart/form-data') {
        opts.body = parseBody(req.body.mimeType, req.body);
      }

      if (hasForm) {
        opts.body = '{{formVariable}}';
      }

      code += JSON.stringify(opts, null, 2);

      if (hasForm) {
        code = code.replace('"{{formVariable}}"', 'form');
      }

      code += ')\n  .then(response => console.log(response))\n';
      code += '  .catch(err => console.error(err));';

      return code;
    }

    function parseBody$1(body) {
      const mime = body.mimeType;

      if (mime === 'application/x-www-form-urlencoded') {
        return `payload = ${body.params.map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`).join('&')}`;
      }

      if (mime === 'multipart/form-data') {
        const payload = {};
        const files = {};
        body.params.forEach(p => {
          if (p.type === 'file') {
            files[p.name] = p.value;
          } else {
            payload[p.name] = p.value;
          }
        });

        return `payload = ${JSON.stringify(payload, null, 2)}\n\nfiles = ${JSON.stringify(files, null, 2)}`;
      }

      if (mime === 'application/json' && body.text) {
        return `payload = ${JSON.stringify(JSON.parse(body.text), null, 2)}\n\nfiles = null`;
      }

      return body.text
        ? `payload = '${body.text}'\n\nfiles = null`
        : 'files = null';
    }

    function python$1(url, req) {
      let code = 'import requests\n\n';
      code += `url = '${url}'\n`;

      if (req.parameters && req.parameters.length) {
        const params = {};
        req.parameters.forEach(p => {
          params[p.name] = p.value;
        });
        code += `querystring = ${JSON.stringify(params)}\n`;
      }

      const headers = {};

      if (req.authHeader) {
        headers[req.authHeader.name] = req.authHeader.value;
      }

      if (req.headers && req.headers.length) {
        req.headers.forEach(h => {
          headers[h.name] = h.value;
        });
      }

      if (req.cookies && req.cookies.length) {
        headers.cookie = req.cookies.map(cookie => `${encodeURIComponent(cookie.key)}=${encodeURIComponent(cookie.value)}`).join('; ');
      }

      if (headers) {
        code += `headers = ${JSON.stringify(headers, null, 2)}\n`;
      }

      const payload = parseBody$1(req.body);
      if (payload) {
        code += `${payload}\n`;
      }

      code += `\nresponse = requests.request('${req.method}', url, ${payload ? 'data = payload, ' : ''}headers=headers, files=files)\n`;
      code += 'print(response.text)';

      return code;
    }

    function parseBody$2(body) {
      const mime = body.mimeType;

      if (mime === 'application/x-www-form-urlencoded') {
        return body.params.map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`).join('&');
      }

      if (mime === 'multipart/form-data') {
        const boundary = '-----011000010111000001101001'; // api :)
        const payload = body.params.map(p => {
          return `${boundary}
Content-Disposition: form-data; name="${p.name}"

${p.value}`;
        }).join('\n');
        return `"${escape$2(payload)}\n${boundary}--"`;
      }

      return JSON.stringify(body.text);
    }

    function getMethod(method) {
      switch (method) {
        case 'GET':
          return 'Get';
        case 'POST':
          return 'Post';
        case 'PATCH':
          return 'Patch';
        case 'PUT':
          return 'Put';
        case 'DELETE':
          return 'Delete';
        default:
          return '{{METHOD}}';
      }
    }

    function ruby$1(url, req) {
      url = parseUrlWithParams(url, req);
      const isHTTPS = url.startsWith('https://');

      let code = "require 'uri'\nrequire 'net/http'\n";

      if (isHTTPS) {
        code += "require 'openssl'\n";
      }

      code += `\nurl = URI("${url}")\n\nhttp = Net::HTTP.new(url.host, url.port)\n`;

      if (isHTTPS) {
        code += 'http.use_ssl = true\nhttp.verify_mode = OpenSSL::SSL::VERIFY_NONE\n';
      }

      code += `\nrequest = Net::HTTP::${getMethod(req.method)}.new(url)\n`;

      if (req.cookies && req.cookies.length) {
        const cookies = [];
        req.cookies.forEach(c => cookies.push(`${encodeURIComponent(c.key)}=${encodeURIComponent(c.value)}`));
        code += `request["cookie"] = '${cookies.join('; ')}'\n`;
      }

      if (req.headers && req.headers.length) {
        req.headers.forEach(header => {
          code += `request["${header.name}"] = ${JSON.stringify(header.value)}\n`;
        });
      }

      if (req.authHeader) {
        code += `request["${req.authHeader.name}"] = ${JSON.stringify(req.authHeader.value)}\n`;
      }

      if (req.body) {
        const body = parseBody$2(req.body);

        if (body) {
          code += `request.body = ${body}\n`;
        }
      }

      code += '\nresponse = http.request(request)\nputs response.read_body';

      return code;
    }

    function php$1(url, req) {
      let code = `<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  `;

      const opts = [
        `CURLOPT_URL => "${parseUrlWithParams(url, req)}"`,
        'CURLOPT_RETURNTRANSFER => true',
        'CURLOPT_ENCODING => ""',
        'CURLOPT_MAXREDIRS => 10',
        'CURLOPT_TIMEOUT => 30',
        'CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1',
        `CURLOPT_CUSTOMREQUEST => "${req.method}"`
      ];

      const body = parseBody$2(req.body);
      if (body) {
        opts.push(`CURLOPT_POSTFIELDS => ${body}`);
      }

      if (req.cookies && req.cookies.length) {
        const cookies = [];
        req.cookies.forEach(c => cookies.push(`${encodeURIComponent(c.key)}=${encodeURIComponent(c.value)}`));
        opts.push(`CURLOPT_COOKIE => '${cookies.join('; ')}'`);
      }

      const headers = [];

      if (req.headers && req.headers.length) {
        req.headers.forEach(h => headers.push(`${h.name}: ${escape$2(h.value)}`));
      }

      if (req.authHeader) {
        headers.push(`'${req.authHeader.name}: ${req.authHeader.value}'`);
      }

      if (headers.length) {
        opts.push(`CURLOPT_HTTPHEADER => array(
    ${headers.join(',\n    ')}
  )`);
      }

      code += `${opts.join(',\n  ')}
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}`;

      return code;
    }

    function parseBody$3(body) {
      const mime = body.mimeType;

      if (mime === 'application/x-www-form-urlencoded') {
        return '"' + body.params.map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value)}`).join('&') + '"';
      }

      if (mime === 'multipart/form-data') {
        const boundary = '-----011000010111000001101001'; // api :)
        const payload = body.params.map(p => {
          return `${boundary}
Content-Disposition: form-data; name="${p.name}"

${p.value}`;
        }).join('\n');
        return `"${escape(payload)}\n${boundary}--"`;
      }

      return JSON.stringify(body.text);
    }

    function golang(url, req) {
      const body = req.body && parseBody$3(req.body);

      let code = `package main

import (
  "fmt"${body ? '\n"strings"' : ''}
  "net/http"
  "io/ioutil"
)

func main() {

  `;

      code += `url := "${parseUrlWithParams(url, req)}"\n`;

      if (body) {
        code += `  payload := strings.NewReader(${body})\n`;
      }

      code += `  req, _ := http.NewRequest("${req.method}" url, ${body ? 'payload' : 'nil'})\n\n`;

      if (req.cookies && req.cookies.length) {
        const cookies = [];
        req.cookies.forEach(c => cookies.push(`${encodeURIComponent(c.key)}=${encodeURIComponent(c.value)}`));
        code += `  req.Header.Add("cookie", ${JSON.stringify(cookies.join(';'))})\n`;
      }

      req.headers.forEach(h => {
        code += `  req.Header.Add("${h.name}", ${JSON.stringify(h.value)})\n`;
      });

      if (req.authHeader) {
        code += `  req.Header.Add("${req.authHeader.name}", ${JSON.stringify(req.authHeader.value)})\n`;
      }

      code += `  res, _ := http.DefaultClient.Do(req)

  defer res.Body.Close()
  body, _ := ioutil.ReadAll(res.Body)

  fmt.Println(res)
  fmt.Println(string(body))

}`;

      return code;
    }

    class CodeGenerator {
      constructor(request, url, cookiejars) {
        this.request = request;
        this.url = url;
        this.cookiejars = cookiejars;
        this.code = null;

        this.request.cookies = this.appendCookies();

        if (this.request.authentication && this.request.authentication.type) {
          this.request.authHeader = generateAuthHeader(this.request.authentication);
        }
      }

      generate(language) {
        switch (language) {
          case 'curl':
            this.code = curl;
            break;
          case 'javascript':
            this.code = javascript$1;
            break;
          case 'python':
            this.code = python$1;
            break;
          case 'node':
            return `const fetch = require('node-fetch');\n\n${javascript$1(this.url, this.request)}`;
          case 'ruby':
            this.code = ruby$1;
            break;
          case 'php':
            this.code = php$1;
            break;
          case 'golang':
            this.code = golang;
            break;
          default:
            return 'Not implemented yet...';
        }

        return this.code(this.url, this.request);
      }

      appendCookies() {
        const cookies = [];

        this.cookiejars.forEach(jar => {
          if (!jar.cookies || !jar.cookies.length) {
            return;
          }

          jar.cookies.forEach(cookie => {
            if (this.url && this.url.includes(cookie.domain) && (cookie.path === '/' || this.url.includes(cookie.path))) {
              cookies.push({
                key: cookie.key,
                value: cookie.value
              });
            }
          });
        });

        return cookies;
      }
    }

    var generateCode = (request, url, language, cookiejars) => new CodeGenerator(request, url, cookiejars).generate(language);

    /* src/components/content/Table.svelte generated by Svelte v3.38.2 */

    const file$3 = "src/components/content/Table.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (8:4) {#if data.note}
    function create_if_block_3(ctx) {
    	let span;
    	let t_value = /*data*/ ctx[0].note + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "note svelte-t9o7qk");
    			add_location(span, file$3, 8, 6, 152);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t_value !== (t_value = /*data*/ ctx[0].note + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(8:4) {#if data.note}",
    		ctx
    	});

    	return block;
    }

    // (13:2) {#if data.text}
    function create_if_block_2(ctx) {
    	let div;
    	let raw_value = /*data*/ ctx[0].text + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "raw-data");
    			add_location(div, file$3, 13, 4, 232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].text + "")) div.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(13:2) {#if data.text}",
    		ctx
    	});

    	return block;
    }

    // (17:2) {#if data.rows && data.rows.length}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[0].rows;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1) {
    				each_value = /*data*/ ctx[0].rows;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(17:2) {#if data.rows && data.rows.length}",
    		ctx
    	});

    	return block;
    }

    // (23:6) {#if row.description}
    function create_if_block_1$1(ctx) {
    	let div;
    	let html_tag;
    	let raw_value = /*row*/ ctx[1].description + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			html_tag = new HtmlTag(t);
    			attr_dev(div, "class", "row description svelte-t9o7qk");
    			add_location(div, file$3, 23, 6, 519);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*row*/ ctx[1].description + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(23:6) {#if row.description}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#each data.rows as row}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*row*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let div1;
    	let raw_value = /*row*/ ctx[1].value + "";
    	let t2;
    	let if_block_anchor;
    	let if_block = /*row*/ ctx[1].description && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "class", "name svelte-t9o7qk");
    			add_location(div0, file$3, 19, 8, 386);
    			attr_dev(div1, "class", "value svelte-t9o7qk");
    			add_location(div1, file$3, 20, 8, 429);
    			attr_dev(div2, "class", "row svelte-t9o7qk");
    			add_location(div2, file$3, 18, 6, 360);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			div1.innerHTML = raw_value;
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*row*/ ctx[1].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*row*/ ctx[1].value + "")) div1.innerHTML = raw_value;
    			if (/*row*/ ctx[1].description) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(18:4) {#each data.rows as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t0_value = /*data*/ ctx[0].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let if_block0 = /*data*/ ctx[0].note && create_if_block_3(ctx);
    	let if_block1 = /*data*/ ctx[0].text && create_if_block_2(ctx);
    	let if_block2 = /*data*/ ctx[0].rows && /*data*/ ctx[0].rows.length && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(span, "class", "title svelte-t9o7qk");
    			add_location(span, file$3, 6, 4, 86);
    			attr_dev(div0, "class", "header svelte-t9o7qk");
    			add_location(div0, file$3, 5, 2, 61);
    			attr_dev(div1, "class", "table svelte-t9o7qk");
    			add_location(div1, file$3, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div0, t1);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t3);
    			if (if_block2) if_block2.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*data*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (/*data*/ ctx[0].note) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*data*/ ctx[0].text) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div1, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*data*/ ctx[0].rows && /*data*/ ctx[0].rows.length) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(div1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Table", slots, []);
    	let { data } = $$props;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Table> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/content/Request.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$4 = "src/components/content/Request.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (101:4) {#if description}
    function create_if_block_5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "description");
    			add_location(div, file$4, 101, 6, 2442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*description*/ ctx[7];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 128) div.innerHTML = /*description*/ ctx[7];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(101:4) {#if description}",
    		ctx
    	});

    	return block;
    }

    // (106:6) {#if request.parameters && request.parameters.length}
    function create_if_block_4(ctx) {
    	let table;
    	let current;

    	table = new Table({
    			props: { data: /*content*/ ctx[5].params() },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};
    			if (dirty & /*content*/ 32) table_changes.data = /*content*/ ctx[5].params();
    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(106:6) {#if request.parameters && request.parameters.length}",
    		ctx
    	});

    	return block;
    }

    // (110:6) {#if (request.headers && request.headers.length) || (request.authentication && request.authentication.type)}
    function create_if_block_3$1(ctx) {
    	let table;
    	let current;

    	table = new Table({
    			props: { data: /*content*/ ctx[5].headers() },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};
    			if (dirty & /*content*/ 32) table_changes.data = /*content*/ ctx[5].headers();
    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(110:6) {#if (request.headers && request.headers.length) || (request.authentication && request.authentication.type)}",
    		ctx
    	});

    	return block;
    }

    // (114:6) {#if request.body && (request.body.text || request.body.params)}
    function create_if_block_2$1(ctx) {
    	let table;
    	let current;

    	table = new Table({
    			props: { data: /*content*/ ctx[5].body() },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const table_changes = {};
    			if (dirty & /*content*/ 32) table_changes.data = /*content*/ ctx[5].body();
    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(114:6) {#if request.body && (request.body.text || request.body.params)}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if reqData.exampleResponses && reqData.exampleResponses.length}
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*reqData*/ ctx[3].exampleResponses;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getClassForStatusCode, reqData, hljs*/ 8) {
    				each_value = /*reqData*/ ctx[3].exampleResponses;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(131:4) {#if reqData.exampleResponses && reqData.exampleResponses.length}",
    		ctx
    	});

    	return block;
    }

    // (133:8) {#if example.value}
    function create_if_block_1$2(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;

    	let t1_value = (/*example*/ ctx[16].code && /*example*/ ctx[16].code.length
    	? ` - ${/*example*/ ctx[16].code}`
    	: "") + "";

    	let t1;
    	let t2;
    	let t3;
    	let pre;
    	let raw_value = core.highlightAuto(/*example*/ ctx[16].value).value + "";
    	let t4;
    	let div2_class_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("Example response");
    			t1 = text(t1_value);
    			t2 = text(":");
    			t3 = space();
    			pre = element("pre");
    			t4 = space();
    			attr_dev(div0, "class", "title svelte-1qvssvw");
    			add_location(div0, file$4, 138, 14, 3611);
    			attr_dev(div1, "class", "header svelte-1qvssvw");
    			add_location(div1, file$4, 137, 12, 3576);
    			attr_dev(pre, "class", "svelte-1qvssvw");
    			add_location(pre, file$4, 144, 12, 3818);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty("code-example example-response " + getClassForStatusCode(/*example*/ ctx[16].code)) + " svelte-1qvssvw"));
    			add_location(div2, file$4, 133, 10, 3442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, pre);
    			pre.innerHTML = raw_value;
    			append_dev(div2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*reqData*/ 8 && t1_value !== (t1_value = (/*example*/ ctx[16].code && /*example*/ ctx[16].code.length
    			? ` - ${/*example*/ ctx[16].code}`
    			: "") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*reqData*/ 8 && raw_value !== (raw_value = core.highlightAuto(/*example*/ ctx[16].value).value + "")) pre.innerHTML = raw_value;
    			if (dirty & /*reqData*/ 8 && div2_class_value !== (div2_class_value = "" + (null_to_empty("code-example example-response " + getClassForStatusCode(/*example*/ ctx[16].code)) + " svelte-1qvssvw"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(133:8) {#if example.value}",
    		ctx
    	});

    	return block;
    }

    // (132:6) {#each reqData.exampleResponses as example}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*example*/ ctx[16].value && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*example*/ ctx[16].value) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(132:6) {#each reqData.exampleResponses as example}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div8;
    	let div2;
    	let div0;
    	let t0;
    	let div0_id_value;
    	let t1;
    	let h3;
    	let strong;
    	let t2_value = /*request*/ ctx[0].method + "";
    	let t2;
    	let strong_class_value;
    	let t3;
    	let t4_value = /*reqData*/ ctx[3].name + "";
    	let t4;
    	let t5;
    	let pre0;
    	let raw0_value = /*reqData*/ ctx[3].url + "";
    	let t6;
    	let t7;
    	let div1;
    	let t8;
    	let t9;
    	let t10;
    	let hr;
    	let t11;
    	let div7;
    	let div6;
    	let div5;
    	let div3;
    	let t13;
    	let div4;
    	let span;
    	let t14;
    	let t15;
    	let pre1;
    	let t16;
    	let current;
    	let if_block0 = /*description*/ ctx[7] && create_if_block_5(ctx);
    	let if_block1 = /*request*/ ctx[0].parameters && /*request*/ ctx[0].parameters.length && create_if_block_4(ctx);
    	let if_block2 = (/*request*/ ctx[0].headers && /*request*/ ctx[0].headers.length || /*request*/ ctx[0].authentication && /*request*/ ctx[0].authentication.type) && create_if_block_3$1(ctx);
    	let if_block3 = /*request*/ ctx[0].body && (/*request*/ ctx[0].body.text || /*request*/ ctx[0].body.params) && create_if_block_2$1(ctx);
    	let if_block4 = /*reqData*/ ctx[3].exampleResponses && /*reqData*/ ctx[3].exampleResponses.length && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(" ");
    			t1 = space();
    			h3 = element("h3");
    			strong = element("strong");
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			pre0 = element("pre");
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t8 = space();
    			if (if_block2) if_block2.c();
    			t9 = space();
    			if (if_block3) if_block3.c();
    			t10 = space();
    			hr = element("hr");
    			t11 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "Example request:";
    			t13 = space();
    			div4 = element("div");
    			span = element("span");
    			t14 = text(/*copyText*/ ctx[4]);
    			t15 = space();
    			pre1 = element("pre");
    			t16 = space();
    			if (if_block4) if_block4.c();
    			attr_dev(div0, "class", "anchor svelte-1qvssvw");
    			attr_dev(div0, "id", div0_id_value = /*request*/ ctx[0]._id);
    			add_location(div0, file$4, 93, 4, 2177);
    			attr_dev(strong, "class", strong_class_value = "" + (null_to_empty(/*request*/ ctx[0].method.toLowerCase()) + " svelte-1qvssvw"));
    			add_location(strong, file$4, 95, 6, 2264);
    			attr_dev(h3, "class", "request-title");
    			add_location(h3, file$4, 94, 4, 2231);
    			attr_dev(pre0, "class", "url svelte-1qvssvw");
    			add_location(pre0, file$4, 98, 4, 2370);
    			attr_dev(div1, "class", "tables");
    			add_location(div1, file$4, 104, 4, 2508);
    			add_location(hr, file$4, 118, 4, 2954);
    			attr_dev(div2, "class", "left");
    			add_location(div2, file$4, 92, 2, 2154);
    			attr_dev(div3, "class", "title svelte-1qvssvw");
    			add_location(div3, file$4, 123, 8, 3058);
    			attr_dev(span, "class", "svelte-1qvssvw");
    			add_location(span, file$4, 125, 10, 3137);
    			attr_dev(div4, "class", "copy");
    			add_location(div4, file$4, 124, 8, 3108);
    			attr_dev(div5, "class", "header svelte-1qvssvw");
    			add_location(div5, file$4, 122, 6, 3029);
    			attr_dev(pre1, "class", "svelte-1qvssvw");
    			add_location(pre1, file$4, 128, 6, 3218);
    			attr_dev(div6, "class", "code-example svelte-1qvssvw");
    			add_location(div6, file$4, 121, 4, 2996);
    			attr_dev(div7, "class", "right");
    			add_location(div7, file$4, 120, 2, 2972);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$4, 91, 0, 2134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, h3);
    			append_dev(h3, strong);
    			append_dev(strong, t2);
    			append_dev(h3, t3);
    			append_dev(h3, t4);
    			append_dev(div2, t5);
    			append_dev(div2, pre0);
    			pre0.innerHTML = raw0_value;
    			append_dev(div2, t6);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t8);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t9);
    			if (if_block3) if_block3.m(div1, null);
    			append_dev(div2, t10);
    			append_dev(div2, hr);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t13);
    			append_dev(div5, div4);
    			append_dev(div4, span);
    			append_dev(span, t14);
    			/*span_binding*/ ctx[13](span);
    			append_dev(div6, t15);
    			append_dev(div6, pre1);
    			pre1.innerHTML = /*exampleHTML*/ ctx[6];
    			/*pre1_binding*/ ctx[14](pre1);
    			append_dev(div7, t16);
    			if (if_block4) if_block4.m(div7, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*request*/ 1 && div0_id_value !== (div0_id_value = /*request*/ ctx[0]._id)) {
    				attr_dev(div0, "id", div0_id_value);
    			}

    			if ((!current || dirty & /*request*/ 1) && t2_value !== (t2_value = /*request*/ ctx[0].method + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*request*/ 1 && strong_class_value !== (strong_class_value = "" + (null_to_empty(/*request*/ ctx[0].method.toLowerCase()) + " svelte-1qvssvw"))) {
    				attr_dev(strong, "class", strong_class_value);
    			}

    			if ((!current || dirty & /*reqData*/ 8) && t4_value !== (t4_value = /*reqData*/ ctx[3].name + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*reqData*/ 8) && raw0_value !== (raw0_value = /*reqData*/ ctx[3].url + "")) pre0.innerHTML = raw0_value;
    			if (/*description*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div2, t7);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*request*/ ctx[0].parameters && /*request*/ ctx[0].parameters.length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*request*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t8);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*request*/ ctx[0].headers && /*request*/ ctx[0].headers.length || /*request*/ ctx[0].authentication && /*request*/ ctx[0].authentication.type) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*request*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_3$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div1, t9);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*request*/ ctx[0].body && (/*request*/ ctx[0].body.text || /*request*/ ctx[0].body.params)) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*request*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_2$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div1, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*copyText*/ 16) set_data_dev(t14, /*copyText*/ ctx[4]);
    			if (!current || dirty & /*exampleHTML*/ 64) pre1.innerHTML = /*exampleHTML*/ ctx[6];
    			if (/*reqData*/ ctx[3].exampleResponses && /*reqData*/ ctx[3].exampleResponses.length) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block$2(ctx);
    					if_block4.c();
    					if_block4.m(div7, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			/*span_binding*/ ctx[13](null);
    			/*pre1_binding*/ ctx[14](null);
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getClassForStatusCode(code) {
    	if (!code) {
    		return "default";
    	}

    	switch (code[0]) {
    		case "1":
    			return "info";
    		case "2":
    			return "success";
    		case "3":
    			return "redirect";
    		case "4":
    			return "client-error";
    		case "5":
    			return "server-error";
    		default:
    			return "default";
    	}
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let content;
    	let reqData;
    	let exampleCode;
    	let exampleHTML;
    	let clipboard;
    	let description;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Request", slots, []);

    	const markdown = new showdown.Converter({
    			tables: true,
    			simplifiedAutoLink: true,
    			openLinksInNewWindow: true,
    			excludeTrailingPunctuationFromURLs: true
    		});

    	let { request } = $$props;
    	let { language = null } = $$props;
    	let { cookiejars } = $$props;
    	let copyText = "Copy to clipboard";
    	let copyButton;
    	let codeElement;
    	const code = document.createElement("code");
    	const writable_props = ["request", "language", "cookiejars"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Request> was created with unknown prop '${key}'`);
    	});

    	function span_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			copyButton = $$value;
    			$$invalidate(1, copyButton);
    		});
    	}

    	function pre1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			codeElement = $$value;
    			$$invalidate(2, codeElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("request" in $$props) $$invalidate(0, request = $$props.request);
    		if ("language" in $$props) $$invalidate(8, language = $$props.language);
    		if ("cookiejars" in $$props) $$invalidate(9, cookiejars = $$props.cookiejars);
    	};

    	$$self.$capture_state = () => ({
    		hljs: core,
    		showdown,
    		ClipboardJS,
    		formatEnv,
    		ContentGenerator,
    		generateCode,
    		Table,
    		markdown,
    		request,
    		language,
    		cookiejars,
    		copyText,
    		copyButton,
    		codeElement,
    		code,
    		getClassForStatusCode,
    		content,
    		reqData,
    		exampleCode,
    		exampleHTML,
    		clipboard,
    		description
    	});

    	$$self.$inject_state = $$props => {
    		if ("request" in $$props) $$invalidate(0, request = $$props.request);
    		if ("language" in $$props) $$invalidate(8, language = $$props.language);
    		if ("cookiejars" in $$props) $$invalidate(9, cookiejars = $$props.cookiejars);
    		if ("copyText" in $$props) $$invalidate(4, copyText = $$props.copyText);
    		if ("copyButton" in $$props) $$invalidate(1, copyButton = $$props.copyButton);
    		if ("codeElement" in $$props) $$invalidate(2, codeElement = $$props.codeElement);
    		if ("content" in $$props) $$invalidate(5, content = $$props.content);
    		if ("reqData" in $$props) $$invalidate(3, reqData = $$props.reqData);
    		if ("exampleCode" in $$props) $$invalidate(11, exampleCode = $$props.exampleCode);
    		if ("exampleHTML" in $$props) $$invalidate(6, exampleHTML = $$props.exampleHTML);
    		if ("clipboard" in $$props) $$invalidate(12, clipboard = $$props.clipboard);
    		if ("description" in $$props) $$invalidate(7, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*request*/ 1) {
    			 $$invalidate(5, content = new ContentGenerator(request));
    		}

    		if ($$self.$$.dirty & /*request*/ 1) {
    			 $$invalidate(3, reqData = {
    				method: request.method,
    				url: formatEnv(request.url),
    				name: request.name,
    				description: request.description,
    				exampleResponses: request.exampleResponses
    			});
    		}

    		if ($$self.$$.dirty & /*request, language, cookiejars*/ 769) {
    			 $$invalidate(11, exampleCode = generateCode(request, request.url, language, cookiejars));
    		}

    		if ($$self.$$.dirty & /*language*/ 256) {
    			 $$invalidate(10, code.className = language, code);
    		}

    		if ($$self.$$.dirty & /*exampleCode*/ 2048) {
    			 $$invalidate(10, code.textContent = exampleCode, code);
    		}

    		if ($$self.$$.dirty & /*code*/ 1024) {
    			 core.highlightBlock(code);
    		}

    		if ($$self.$$.dirty & /*code*/ 1024) {
    			 $$invalidate(6, exampleHTML = code.outerHTML);
    		}

    		if ($$self.$$.dirty & /*copyButton, codeElement*/ 6) {
    			 $$invalidate(12, clipboard = copyButton && new ClipboardJS(copyButton,
    			{
    					target() {
    						return codeElement;
    					}
    				}));
    		}

    		if ($$self.$$.dirty & /*clipboard*/ 4096) {
    			 clipboard && clipboard.on("success", function () {
    				$$invalidate(4, copyText = "Copied!");
    				setTimeout(() => $$invalidate(4, copyText = "Copy to Clipboard"), 5000);
    			});
    		}

    		if ($$self.$$.dirty & /*clipboard*/ 4096) {
    			 clipboard && clipboard.on("error", function (err) {
    				console.error(err);
    				$$invalidate(4, copyText = "Failed to copy :(");
    				setTimeout(() => $$invalidate(4, copyText = "Copy to Clipboard"), 5000);
    			});
    		}

    		if ($$self.$$.dirty & /*reqData*/ 8) {
    			 $$invalidate(7, description = reqData.description && markdown.makeHtml(reqData.description));
    		}
    	};

    	return [
    		request,
    		copyButton,
    		codeElement,
    		reqData,
    		copyText,
    		content,
    		exampleHTML,
    		description,
    		language,
    		cookiejars,
    		code,
    		exampleCode,
    		clipboard,
    		span_binding,
    		pre1_binding
    	];
    }

    class Request$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { request: 0, language: 8, cookiejars: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Request",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*request*/ ctx[0] === undefined && !("request" in props)) {
    			console_1.warn("<Request> was created without expected prop 'request'");
    		}

    		if (/*cookiejars*/ ctx[9] === undefined && !("cookiejars" in props)) {
    			console_1.warn("<Request> was created without expected prop 'cookiejars'");
    		}
    	}

    	get request() {
    		throw new Error("<Request>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set request(value) {
    		throw new Error("<Request>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<Request>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Request>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cookiejars() {
    		throw new Error("<Request>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cookiejars(value) {
    		throw new Error("<Request>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function applyEnv (value, env) {
      if (!value) {
        return null;
      }

      Object.keys(env.data).forEach(key => {
        value = value.replace(new RegExp('{{(\\s*(_.)?' + key + '\\s*)}}', 'g'), env.data[key]);
      });

      return value;
    }

    /* src/components/content/Group.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/components/content/Group.svelte";

    // (33:4) {#if description}
    function create_if_block$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "description");
    			add_location(div, file$5, 33, 6, 902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*description*/ ctx[1];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 2) div.innerHTML = /*description*/ ctx[1];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(33:4) {#if description}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div0;
    	let h2;
    	let t0_value = /*groupData*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let t2;
    	let hr;
    	let t3;
    	let div1;
    	let if_block = /*description*/ ctx[1] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			hr = element("hr");
    			t3 = space();
    			div1 = element("div");
    			add_location(h2, file$5, 30, 4, 847);
    			add_location(hr, file$5, 36, 4, 968);
    			attr_dev(div0, "class", "left");
    			add_location(div0, file$5, 29, 2, 824);
    			attr_dev(div1, "class", "right");
    			add_location(div1, file$5, 38, 2, 986);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$5, 28, 0, 804);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(div0, t1);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t2);
    			append_dev(div0, hr);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*groupData*/ 1 && t0_value !== (t0_value = /*groupData*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (/*description*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div0, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let groupData;
    	let description;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Group", slots, []);

    	const markdown = new showdown.Converter({
    			simplifiedAutoLink: true,
    			openLinksInNewWindow: true,
    			excludeTrailingPunctuationFromURLs: true,
    			tables: true
    		});

    	let { group } = $$props;
    	let { env } = $$props;
    	const writable_props = ["group", "env"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Group> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("group" in $$props) $$invalidate(2, group = $$props.group);
    		if ("env" in $$props) $$invalidate(3, env = $$props.env);
    	};

    	$$self.$capture_state = () => ({
    		applyEnv,
    		showdown,
    		markdown,
    		group,
    		env,
    		groupData,
    		description
    	});

    	$$self.$inject_state = $$props => {
    		if ("group" in $$props) $$invalidate(2, group = $$props.group);
    		if ("env" in $$props) $$invalidate(3, env = $$props.env);
    		if ("groupData" in $$props) $$invalidate(0, groupData = $$props.groupData);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*group, env*/ 12) {
    			 $$invalidate(0, groupData = {
    				name: applyEnv(group.name, env),
    				description: applyEnv(group.description, env)
    			});
    		}

    		if ($$self.$$.dirty & /*groupData*/ 1) {
    			// The Insomnia JSON file seems to have a description field here, but I couldn't find
    			// any way to change the description of the groups in Insomnia itself.
    			// The declaration will stay here anyway in case there will be better support for
    			// this added later on in Insomnia.
    			 $$invalidate(1, description = groupData.description && markdown.makeHtml(groupData.description));
    		}
    	};

    	return [groupData, description, group, env];
    }

    class Group$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { group: 2, env: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Group",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*group*/ ctx[2] === undefined && !("group" in props)) {
    			console.warn("<Group> was created without expected prop 'group'");
    		}

    		if (/*env*/ ctx[3] === undefined && !("env" in props)) {
    			console.warn("<Group> was created without expected prop 'env'");
    		}
    	}

    	get group() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get env() {
    		throw new Error("<Group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set env(value) {
    		throw new Error("<Group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/content/Rows.svelte generated by Svelte v3.38.2 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (14:2) {:else}
    function create_else_block(ctx) {
    	let group;
    	let t;
    	let rows;
    	let current;

    	group = new Group$1({
    			props: {
    				group: /*row*/ ctx[4],
    				env: /*env*/ ctx[1]
    			},
    			$$inline: true
    		});

    	rows = new Rows({
    			props: {
    				content: [.../*row*/ ctx[4].requests, .../*row*/ ctx[4].children],
    				env: /*env*/ ctx[1],
    				language: /*language*/ ctx[2],
    				cookiejars: /*cookiejars*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(group.$$.fragment);
    			t = space();
    			create_component(rows.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(group, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(rows, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const group_changes = {};
    			if (dirty & /*content*/ 1) group_changes.group = /*row*/ ctx[4];
    			if (dirty & /*env*/ 2) group_changes.env = /*env*/ ctx[1];
    			group.$set(group_changes);
    			const rows_changes = {};
    			if (dirty & /*content*/ 1) rows_changes.content = [.../*row*/ ctx[4].requests, .../*row*/ ctx[4].children];
    			if (dirty & /*env*/ 2) rows_changes.env = /*env*/ ctx[1];
    			if (dirty & /*language*/ 4) rows_changes.language = /*language*/ ctx[2];
    			if (dirty & /*cookiejars*/ 8) rows_changes.cookiejars = /*cookiejars*/ ctx[3];
    			rows.$set(rows_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(group.$$.fragment, local);
    			transition_in(rows.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(group.$$.fragment, local);
    			transition_out(rows.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(group, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(rows, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(14:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#if row._type === 'request'}
    function create_if_block$4(ctx) {
    	let request;
    	let current;

    	request = new Request$1({
    			props: {
    				request: /*row*/ ctx[4],
    				env: /*env*/ ctx[1],
    				language: /*language*/ ctx[2],
    				cookiejars: /*cookiejars*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(request.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(request, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const request_changes = {};
    			if (dirty & /*content*/ 1) request_changes.request = /*row*/ ctx[4];
    			if (dirty & /*env*/ 2) request_changes.env = /*env*/ ctx[1];
    			if (dirty & /*language*/ 4) request_changes.language = /*language*/ ctx[2];
    			if (dirty & /*cookiejars*/ 8) request_changes.cookiejars = /*cookiejars*/ ctx[3];
    			request.$set(request_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(request.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(request.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(request, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(12:2) {#if row._type === 'request'}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#each content as row}
    function create_each_block$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*row*/ ctx[4]._type === "request") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(11:0) {#each content as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*content*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content, env, language, cookiejars*/ 15) {
    				each_value = /*content*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Rows", slots, []);
    	let { content } = $$props;
    	let { env } = $$props;
    	let { language } = $$props;
    	let { cookiejars } = $$props;
    	const writable_props = ["content", "env", "language", "cookiejars"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Rows> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("env" in $$props) $$invalidate(1, env = $$props.env);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("cookiejars" in $$props) $$invalidate(3, cookiejars = $$props.cookiejars);
    	};

    	$$self.$capture_state = () => ({
    		Request: Request$1,
    		Group: Group$1,
    		content,
    		env,
    		language,
    		cookiejars
    	});

    	$$self.$inject_state = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("env" in $$props) $$invalidate(1, env = $$props.env);
    		if ("language" in $$props) $$invalidate(2, language = $$props.language);
    		if ("cookiejars" in $$props) $$invalidate(3, cookiejars = $$props.cookiejars);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, env, language, cookiejars];
    }

    class Rows extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			content: 0,
    			env: 1,
    			language: 2,
    			cookiejars: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rows",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[0] === undefined && !("content" in props)) {
    			console.warn("<Rows> was created without expected prop 'content'");
    		}

    		if (/*env*/ ctx[1] === undefined && !("env" in props)) {
    			console.warn("<Rows> was created without expected prop 'env'");
    		}

    		if (/*language*/ ctx[2] === undefined && !("language" in props)) {
    			console.warn("<Rows> was created without expected prop 'language'");
    		}

    		if (/*cookiejars*/ ctx[3] === undefined && !("cookiejars" in props)) {
    			console.warn("<Rows> was created without expected prop 'cookiejars'");
    		}
    	}

    	get content() {
    		throw new Error("<Rows>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<Rows>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get env() {
    		throw new Error("<Rows>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set env(value) {
    		throw new Error("<Rows>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get language() {
    		throw new Error("<Rows>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set language(value) {
    		throw new Error("<Rows>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cookiejars() {
    		throw new Error("<Rows>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cookiejars(value) {
    		throw new Error("<Rows>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/Item.svelte generated by Svelte v3.38.2 */

    const file$6 = "node_modules/svelte-select/src/Item.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "";
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-u114qp");
    			add_location(div, file$6, 61, 0, 1295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getOptionLabel, item, filterText*/ 7 && raw_value !== (raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "")) div.innerHTML = raw_value;
    			if (dirty & /*itemClasses*/ 8 && div_class_value !== (div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-u114qp")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Item", slots, []);
    	let { isActive = false } = $$props;
    	let { isFirst = false } = $$props;
    	let { isHover = false } = $$props;
    	let { getOptionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let itemClasses = "";
    	const writable_props = ["isActive", "isFirst", "isHover", "getOptionLabel", "item", "filterText"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		isActive,
    		isFirst,
    		isHover,
    		getOptionLabel,
    		item,
    		filterText,
    		itemClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
    		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
    		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
    		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
    		if ("itemClasses" in $$props) $$invalidate(3, itemClasses = $$props.itemClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isActive, isFirst, isHover, item*/ 114) {
    			 {
    				const classes = [];

    				if (isActive) {
    					classes.push("active");
    				}

    				if (isFirst) {
    					classes.push("first");
    				}

    				if (isHover) {
    					classes.push("hover");
    				}

    				if (item.isGroupHeader) {
    					classes.push("groupHeader");
    				}

    				if (item.isGroupItem) {
    					classes.push("groupItem");
    				}

    				$$invalidate(3, itemClasses = classes.join(" "));
    			}
    		}
    	};

    	return [getOptionLabel, item, filterText, itemClasses, isActive, isFirst, isHover];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			isActive: 4,
    			isFirst: 5,
    			isHover: 6,
    			getOptionLabel: 0,
    			item: 1,
    			filterText: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get isActive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFirst() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFirst(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isHover() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isHover(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/VirtualList.svelte generated by Svelte v3.38.2 */
    const file$7 = "node_modules/svelte-select/src/VirtualList.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    const get_default_slot_changes = dirty => ({
    	item: dirty & /*visible*/ 32,
    	i: dirty & /*visible*/ 32,
    	hoverItemIndex: dirty & /*hoverItemIndex*/ 2
    });

    const get_default_slot_context = ctx => ({
    	item: /*row*/ ctx[23].data,
    	i: /*row*/ ctx[23].index,
    	hoverItemIndex: /*hoverItemIndex*/ ctx[1]
    });

    // (160:57) Missing template
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Missing template");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(160:57) Missing template",
    		ctx
    	});

    	return block;
    }

    // (158:2) {#each visible as row (row.index)}
    function create_each_block$4(key_1, ctx) {
    	let svelte_virtual_list_row;
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			svelte_virtual_list_row = element("svelte-virtual-list-row");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			t = space();
    			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-8nn5yg");
    			add_location(svelte_virtual_list_row, file$7, 158, 3, 3501);
    			this.first = svelte_virtual_list_row;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_row, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(svelte_virtual_list_row, null);
    			}

    			append_dev(svelte_virtual_list_row, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, visible, hoverItemIndex*/ 16418)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_row);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(158:2) {#each visible as row (row.index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let svelte_virtual_list_viewport;
    	let svelte_virtual_list_contents;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let svelte_virtual_list_viewport_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*visible*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*row*/ ctx[23].index;
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
    			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-8nn5yg");
    			add_location(svelte_virtual_list_contents, file$7, 156, 1, 3351);
    			set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-8nn5yg");
    			add_render_callback(() => /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[18].call(svelte_virtual_list_viewport));
    			add_location(svelte_virtual_list_viewport, file$7, 154, 0, 3209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_virtual_list_viewport, anchor);
    			append_dev(svelte_virtual_list_viewport, svelte_virtual_list_contents);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svelte_virtual_list_contents, null);
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[16](svelte_virtual_list_contents);
    			/*svelte_virtual_list_viewport_binding*/ ctx[17](svelte_virtual_list_viewport);
    			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[18].bind(svelte_virtual_list_viewport));
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svelte_virtual_list_viewport, "scroll", /*handle_scroll*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$scope, visible, hoverItemIndex*/ 16418) {
    				each_value = /*visible*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
    				check_outros();
    			}

    			if (!current || dirty & /*top*/ 64) {
    				set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
    			}

    			if (!current || dirty & /*bottom*/ 128) {
    				set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
    			}

    			if (!current || dirty & /*height*/ 1) {
    				set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_virtual_list_viewport);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*svelte_virtual_list_contents_binding*/ ctx[16](null);
    			/*svelte_virtual_list_viewport_binding*/ ctx[17](null);
    			svelte_virtual_list_viewport_resize_listener();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VirtualList", slots, ['default']);
    	let { items = undefined } = $$props;
    	let { height = "100%" } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { start = 0 } = $$props;
    	let { end = 0 } = $$props;

    	// local state
    	let height_map = [];

    	let rows;
    	let viewport;
    	let contents;
    	let viewport_height = 0;
    	let visible;
    	let mounted;
    	let top = 0;
    	let bottom = 0;
    	let average_height;

    	async function refresh(items, viewport_height, itemHeight) {
    		const { scrollTop } = viewport;
    		await tick(); // wait until the DOM is up to date
    		let content_height = top - scrollTop;
    		let i = start;

    		while (content_height < viewport_height && i < items.length) {
    			let row = rows[i - start];

    			if (!row) {
    				$$invalidate(10, end = i + 1);
    				await tick(); // render the newly visible row
    				row = rows[i - start];
    			}

    			const row_height = height_map[i] = itemHeight || row.offsetHeight;
    			content_height += row_height;
    			i += 1;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = (top + content_height) / end;
    		$$invalidate(7, bottom = remaining * average_height);
    		height_map.length = items.length;
    		$$invalidate(3, viewport.scrollTop = 0, viewport);
    	}

    	async function handle_scroll() {
    		const { scrollTop } = viewport;
    		const old_start = start;

    		for (let v = 0; v < rows.length; v += 1) {
    			height_map[start + v] = itemHeight || rows[v].offsetHeight;
    		}

    		let i = 0;
    		let y = 0;

    		while (i < items.length) {
    			const row_height = height_map[i] || average_height;

    			if (y + row_height > scrollTop) {
    				$$invalidate(9, start = i);
    				$$invalidate(6, top = y);
    				break;
    			}

    			y += row_height;
    			i += 1;
    		}

    		while (i < items.length) {
    			y += height_map[i] || average_height;
    			i += 1;
    			if (y > scrollTop + viewport_height) break;
    		}

    		$$invalidate(10, end = i);
    		const remaining = items.length - end;
    		average_height = y / end;
    		while (i < items.length) height_map[i++] = average_height;
    		$$invalidate(7, bottom = remaining * average_height);

    		// prevent jumping if we scrolled up into unknown territory
    		if (start < old_start) {
    			await tick();
    			let expected_height = 0;
    			let actual_height = 0;

    			for (let i = start; i < old_start; i += 1) {
    				if (rows[i - start]) {
    					expected_height += height_map[i];
    					actual_height += itemHeight || rows[i - start].offsetHeight;
    				}
    			}

    			const d = actual_height - expected_height;
    			viewport.scrollTo(0, scrollTop + d);
    		}
    	} // TODO if we overestimated the space these
    	// rows would occupy we may need to add some

    	// more. maybe we can just call handle_scroll again?
    	// trigger initial refresh
    	onMount(() => {
    		rows = contents.getElementsByTagName("svelte-virtual-list-row");
    		$$invalidate(13, mounted = true);
    	});

    	const writable_props = ["items", "height", "itemHeight", "hoverItemIndex", "start", "end"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VirtualList> was created with unknown prop '${key}'`);
    	});

    	function svelte_virtual_list_contents_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			contents = $$value;
    			$$invalidate(4, contents);
    		});
    	}

    	function svelte_virtual_list_viewport_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			viewport = $$value;
    			$$invalidate(3, viewport);
    		});
    	}

    	function svelte_virtual_list_viewport_elementresize_handler() {
    		viewport_height = this.offsetHeight;
    		$$invalidate(2, viewport_height);
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		items,
    		height,
    		itemHeight,
    		hoverItemIndex,
    		start,
    		end,
    		height_map,
    		rows,
    		viewport,
    		contents,
    		viewport_height,
    		visible,
    		mounted,
    		top,
    		bottom,
    		average_height,
    		refresh,
    		handle_scroll
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("start" in $$props) $$invalidate(9, start = $$props.start);
    		if ("end" in $$props) $$invalidate(10, end = $$props.end);
    		if ("height_map" in $$props) height_map = $$props.height_map;
    		if ("rows" in $$props) rows = $$props.rows;
    		if ("viewport" in $$props) $$invalidate(3, viewport = $$props.viewport);
    		if ("contents" in $$props) $$invalidate(4, contents = $$props.contents);
    		if ("viewport_height" in $$props) $$invalidate(2, viewport_height = $$props.viewport_height);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    		if ("mounted" in $$props) $$invalidate(13, mounted = $$props.mounted);
    		if ("top" in $$props) $$invalidate(6, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(7, bottom = $$props.bottom);
    		if ("average_height" in $$props) average_height = $$props.average_height;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items, start, end*/ 3584) {
    			 $$invalidate(5, visible = items.slice(start, end).map((data, i) => {
    				return { index: i + start, data };
    			}));
    		}

    		if ($$self.$$.dirty & /*mounted, items, viewport_height, itemHeight*/ 14340) {
    			// whenever `items` changes, invalidate the current heightmap
    			 if (mounted) refresh(items, viewport_height, itemHeight);
    		}
    	};

    	return [
    		height,
    		hoverItemIndex,
    		viewport_height,
    		viewport,
    		contents,
    		visible,
    		top,
    		bottom,
    		handle_scroll,
    		start,
    		end,
    		items,
    		itemHeight,
    		mounted,
    		$$scope,
    		slots,
    		svelte_virtual_list_contents_binding,
    		svelte_virtual_list_viewport_binding,
    		svelte_virtual_list_viewport_elementresize_handler
    	];
    }

    class VirtualList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			items: 11,
    			height: 0,
    			itemHeight: 12,
    			hoverItemIndex: 1,
    			start: 9,
    			end: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VirtualList",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get items() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/List.svelte generated by Svelte v3.38.2 */
    const file$8 = "node_modules/svelte-select/src/List.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (210:0) {#if isVirtualList}
    function create_if_block_3$2(ctx) {
    	let div;
    	let virtuallist;
    	let current;

    	virtuallist = new VirtualList({
    			props: {
    				items: /*items*/ ctx[4],
    				itemHeight: /*itemHeight*/ ctx[7],
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ item, i }) => ({ 34: item, 36: i }),
    						({ item, i }) => [0, (item ? 8 : 0) | (i ? 32 : 0)]
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(virtuallist.$$.fragment);
    			attr_dev(div, "class", "listContainer virtualList svelte-1rmpqnb");
    			add_location(div, file$8, 210, 0, 5850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(virtuallist, div, null);
    			/*div_binding*/ ctx[20](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const virtuallist_changes = {};
    			if (dirty[0] & /*items*/ 16) virtuallist_changes.items = /*items*/ ctx[4];
    			if (dirty[0] & /*itemHeight*/ 128) virtuallist_changes.itemHeight = /*itemHeight*/ ctx[7];

    			if (dirty[0] & /*Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, items*/ 4918 | dirty[1] & /*$$scope, item, i*/ 104) {
    				virtuallist_changes.$$scope = { dirty, ctx };
    			}

    			virtuallist.$set(virtuallist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(virtuallist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(virtuallist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(virtuallist);
    			/*div_binding*/ ctx[20](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(210:0) {#if isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (213:2) <VirtualList {items} {itemHeight} let:item let:i>
    function create_default_slot(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[18](/*i*/ ctx[36]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[19](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$8, 214, 4, 5970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(div, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[1] & /*item*/ 8) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[1] & /*i*/ 32) switch_instance_changes.isFirst = isItemFirst(/*i*/ ctx[36]);
    			if (dirty[0] & /*selectedValue, optionIdentifier*/ 768 | dirty[1] & /*item*/ 8) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18 | dirty[1] & /*item, i*/ 40) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(213:2) <VirtualList {items} {itemHeight} let:item let:i>",
    		ctx
    	});

    	return block;
    }

    // (232:0) {#if !isVirtualList}
    function create_if_block$5(ctx) {
    	let div;
    	let current;
    	let each_value = /*items*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div, "class", "listContainer svelte-1rmpqnb");
    			add_location(div, file$8, 232, 0, 6477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div, null);
    			}

    			/*div_binding_1*/ ctx[23](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items, handleHover, handleClick, Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, noOptionsMessage, hideEmptyState*/ 32630) {
    				each_value = /*items*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block_1(ctx);
    					each_1_else.c();
    					each_1_else.m(div, null);
    				} else if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			/*div_binding_1*/ ctx[23](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(232:0) {#if !isVirtualList}",
    		ctx
    	});

    	return block;
    }

    // (254:2) {:else}
    function create_else_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = !/*hideEmptyState*/ ctx[10] && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*hideEmptyState*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(254:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (255:4) {#if !hideEmptyState}
    function create_if_block_2$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*noOptionsMessage*/ ctx[11]);
    			attr_dev(div, "class", "empty svelte-1rmpqnb");
    			add_location(div, file$8, 255, 6, 7178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noOptionsMessage*/ 2048) set_data_dev(t, /*noOptionsMessage*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(255:4) {#if !hideEmptyState}",
    		ctx
    	});

    	return block;
    }

    // (237:4) { :else }
    function create_else_block$1(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Item*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*item*/ ctx[34],
    				filterText: /*filterText*/ ctx[12],
    				getOptionLabel: /*getOptionLabel*/ ctx[5],
    				isFirst: isItemFirst(/*i*/ ctx[36]),
    				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
    				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	function mouseover_handler_1() {
    		return /*mouseover_handler_1*/ ctx[21](/*i*/ ctx[36]);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[22](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "listItem");
    			add_location(div, file$8, 237, 4, 6691);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler_1, false, false, false),
    					listen_dev(div, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[0] & /*items*/ 16) switch_instance_changes.item = /*item*/ ctx[34];
    			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
    			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
    			if (dirty[0] & /*items, selectedValue, optionIdentifier*/ 784) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
    			if (dirty[0] & /*hoverItemIndex, items*/ 18) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

    			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(237:4) { :else }",
    		ctx
    	});

    	return block;
    }

    // (235:4) {#if item.isGroupHeader && !item.isSelectable}
    function create_if_block_1$3(ctx) {
    	let div;
    	let t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "listGroupTitle svelte-1rmpqnb");
    			add_location(div, file$8, 235, 6, 6611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*getGroupHeaderLabel, items*/ 80 && t_value !== (t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(235:4) {#if item.isGroupHeader && !item.isSelectable}",
    		ctx
    	});

    	return block;
    }

    // (234:2) {#each items as item, i}
    function create_each_block$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[34].isGroupHeader && !/*item*/ ctx[34].isSelectable) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(234:2) {#each items as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*isVirtualList*/ ctx[3] && create_if_block_3$2(ctx);
    	let if_block1 = !/*isVirtualList*/ ctx[3] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeyDown*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*isVirtualList*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*isVirtualList*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isVirtualList*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function itemClasses(hoverItemIndex, item, itemIndex, items, selectedValue, optionIdentifier, isMulti) {
    	return `${selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]
	? "active "
	: ""}${hoverItemIndex === itemIndex || items.length === 1
	? "hover"
	: ""}`;
    }

    function isItemActive(item, selectedValue, optionIdentifier) {
    	return selectedValue && selectedValue[optionIdentifier] === item[optionIdentifier];
    }

    function isItemFirst(itemIndex) {
    	return itemIndex === 0;
    }

    function isItemHover(hoverItemIndex, item, itemIndex, items) {
    	return hoverItemIndex === itemIndex || items.length === 1;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, []);
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { items = [] } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		if (option) return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { itemHeight = 40 } = $$props;
    	let { hoverItemIndex = 0 } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { optionIdentifier = "value" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { isMulti = false } = $$props;
    	let { activeItemIndex = 0 } = $$props;
    	let { filterText = "" } = $$props;
    	let isScrollingTimer = 0;
    	let isScrolling = false;
    	let prev_items;
    	let prev_activeItemIndex;
    	let prev_selectedValue;

    	onMount(() => {
    		if (items.length > 0 && !isMulti && selectedValue) {
    			const _hoverItemIndex = items.findIndex(item => item[optionIdentifier] === selectedValue[optionIdentifier]);

    			if (_hoverItemIndex) {
    				$$invalidate(1, hoverItemIndex = _hoverItemIndex);
    			}
    		}

    		scrollToActiveItem("active");

    		container.addEventListener(
    			"scroll",
    			() => {
    				clearTimeout(isScrollingTimer);

    				isScrollingTimer = setTimeout(
    					() => {
    						isScrolling = false;
    					},
    					100
    				);
    			},
    			false
    		);
    	});

    	onDestroy(() => {
    		
    	}); // clearTimeout(isScrollingTimer);

    	beforeUpdate(() => {
    		if (items !== prev_items && items.length > 0) {
    			$$invalidate(1, hoverItemIndex = 0);
    		}

    		// if (prev_activeItemIndex && activeItemIndex > -1) {
    		//   hoverItemIndex = activeItemIndex;
    		//   scrollToActiveItem('active');
    		// }
    		// if (prev_selectedValue && selectedValue) {
    		//   scrollToActiveItem('active');
    		//   if (items && !isMulti) {
    		//     const hoverItemIndex = items.findIndex((item) => item[optionIdentifier] === selectedValue[optionIdentifier]);
    		//     if (hoverItemIndex) {
    		//       hoverItemIndex = hoverItemIndex;
    		//     }
    		//   }
    		// }
    		prev_items = items;

    		prev_activeItemIndex = activeItemIndex;
    		prev_selectedValue = selectedValue;
    	});

    	function handleSelect(item) {
    		if (item.isCreator) return;
    		dispatch("itemSelected", item);
    	}

    	function handleHover(i) {
    		if (isScrolling) return;
    		$$invalidate(1, hoverItemIndex = i);
    	}

    	function handleClick(args) {
    		const { item, i, event } = args;
    		event.stopPropagation();
    		if (selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]) return closeList();

    		if (item.isCreator) {
    			dispatch("itemCreated", filterText);
    		} else {
    			$$invalidate(16, activeItemIndex = i);
    			$$invalidate(1, hoverItemIndex = i);
    			handleSelect(item);
    		}
    	}

    	function closeList() {
    		dispatch("closeList");
    	}

    	async function updateHoverItem(increment) {
    		if (isVirtualList) return;
    		let isNonSelectableItem = true;

    		while (isNonSelectableItem) {
    			if (increment > 0 && hoverItemIndex === items.length - 1) {
    				$$invalidate(1, hoverItemIndex = 0);
    			} else if (increment < 0 && hoverItemIndex === 0) {
    				$$invalidate(1, hoverItemIndex = items.length - 1);
    			} else {
    				$$invalidate(1, hoverItemIndex = hoverItemIndex + increment);
    			}

    			isNonSelectableItem = items[hoverItemIndex].isGroupHeader && !items[hoverItemIndex].isSelectable;
    		}

    		await tick();
    		scrollToActiveItem("hover");
    	}

    	function handleKeyDown(e) {
    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				items.length && updateHoverItem(1);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				items.length && updateHoverItem(-1);
    				break;
    			case "Enter":
    				e.preventDefault();
    				if (items.length === 0) break;
    				const hoverItem = items[hoverItemIndex];
    				if (selectedValue && !isMulti && selectedValue[optionIdentifier] === hoverItem[optionIdentifier]) {
    					closeList();
    					break;
    				}
    				if (hoverItem.isCreator) {
    					dispatch("itemCreated", filterText);
    				} else {
    					$$invalidate(16, activeItemIndex = hoverItemIndex);
    					handleSelect(items[hoverItemIndex]);
    				}
    				break;
    			case "Tab":
    				e.preventDefault();
    				if (items.length === 0) break;
    				if (selectedValue && selectedValue[optionIdentifier] === items[hoverItemIndex][optionIdentifier]) return closeList();
    				$$invalidate(16, activeItemIndex = hoverItemIndex);
    				handleSelect(items[hoverItemIndex]);
    				break;
    		}
    	}

    	function scrollToActiveItem(className) {
    		if (isVirtualList || !container) return;
    		let offsetBounding;
    		const focusedElemBounding = container.querySelector(`.listItem .${className}`);

    		if (focusedElemBounding) {
    			offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
    		}

    		$$invalidate(0, container.scrollTop -= offsetBounding, container);
    	}

    	
    	

    	const writable_props = [
    		"container",
    		"Item",
    		"isVirtualList",
    		"items",
    		"getOptionLabel",
    		"getGroupHeaderLabel",
    		"itemHeight",
    		"hoverItemIndex",
    		"selectedValue",
    		"optionIdentifier",
    		"hideEmptyState",
    		"noOptionsMessage",
    		"isMulti",
    		"activeItemIndex",
    		"filterText"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = i => handleHover(i);
    	const click_handler = (item, i, event) => handleClick({ item, i, event });

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	const mouseover_handler_1 = i => handleHover(i);
    	const click_handler_1 = (item, i, event) => handleClick({ item, i, event });

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		dispatch,
    		container,
    		ItemComponent: Item,
    		VirtualList,
    		Item: Item$1,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		hoverItemIndex,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		isMulti,
    		activeItemIndex,
    		filterText,
    		isScrollingTimer,
    		isScrolling,
    		prev_items,
    		prev_activeItemIndex,
    		prev_selectedValue,
    		itemClasses,
    		handleSelect,
    		handleHover,
    		handleClick,
    		closeList,
    		updateHoverItem,
    		handleKeyDown,
    		scrollToActiveItem,
    		isItemActive,
    		isItemFirst,
    		isItemHover
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
    		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
    		if ("items" in $$props) $$invalidate(4, items = $$props.items);
    		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
    		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
    		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
    		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
    		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
    		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
    		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
    		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
    		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
    		if ("isScrollingTimer" in $$props) isScrollingTimer = $$props.isScrollingTimer;
    		if ("isScrolling" in $$props) isScrolling = $$props.isScrolling;
    		if ("prev_items" in $$props) prev_items = $$props.prev_items;
    		if ("prev_activeItemIndex" in $$props) prev_activeItemIndex = $$props.prev_activeItemIndex;
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		container,
    		hoverItemIndex,
    		Item$1,
    		isVirtualList,
    		items,
    		getOptionLabel,
    		getGroupHeaderLabel,
    		itemHeight,
    		selectedValue,
    		optionIdentifier,
    		hideEmptyState,
    		noOptionsMessage,
    		filterText,
    		handleHover,
    		handleClick,
    		handleKeyDown,
    		activeItemIndex,
    		isMulti,
    		mouseover_handler,
    		click_handler,
    		div_binding,
    		mouseover_handler_1,
    		click_handler_1,
    		div_binding_1
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				container: 0,
    				Item: 2,
    				isVirtualList: 3,
    				items: 4,
    				getOptionLabel: 5,
    				getGroupHeaderLabel: 6,
    				itemHeight: 7,
    				hoverItemIndex: 1,
    				selectedValue: 8,
    				optionIdentifier: 9,
    				hideEmptyState: 10,
    				noOptionsMessage: 11,
    				isMulti: 17,
    				activeItemIndex: 16,
    				filterText: 12
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get container() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoverItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hoverItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeItemIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/Selection.svelte generated by Svelte v3.38.2 */

    const file$9 = "node_modules/svelte-select/src/Selection.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "";

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "selection svelte-17yna57");
    			add_location(div, file$9, 13, 0, 200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getSelectionLabel, item*/ 3 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "")) div.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Selection", slots, []);
    	let { getSelectionLabel = undefined } = $$props;
    	let { item = undefined } = $$props;
    	const writable_props = ["getSelectionLabel", "item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ getSelectionLabel, item });

    	$$self.$inject_state = $$props => {
    		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getSelectionLabel, item];
    }

    class Selection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { getSelectionLabel: 0, item: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Selection",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get getSelectionLabel() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-select/src/MultiSelection.svelte generated by Svelte v3.38.2 */
    const file$a = "node_modules/svelte-select/src/MultiSelection.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (23:2) {#if !isDisabled && !multiFullItemClearable}
    function create_if_block$6(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*i*/ ctx[11], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$a, 25, 6, 950);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			attr_dev(svg, "class", "svelte-1k6n0vy");
    			add_location(svg, file$a, 24, 4, 851);
    			attr_dev(div, "class", "multiSelectItem_clear svelte-1k6n0vy");
    			add_location(div, file$a, 23, 2, 767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(23:2) {#if !isDisabled && !multiFullItemClearable}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#each selectedValue as value, i}
    function create_each_block$6(ctx) {
    	let div1;
    	let div0;
    	let raw_value = /*getSelectionLabel*/ ctx[4](/*value*/ ctx[9]) + "";
    	let t0;
    	let t1;
    	let div1_class_value;
    	let mounted;
    	let dispose;
    	let if_block = !/*isDisabled*/ ctx[2] && !/*multiFullItemClearable*/ ctx[3] && create_if_block$6(ctx);

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[7](/*i*/ ctx[11], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div0, "class", "multiSelectItem_label svelte-1k6n0vy");
    			add_location(div0, file$a, 19, 2, 636);

    			attr_dev(div1, "class", div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[11]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-1k6n0vy");

    			add_location(div1, file$a, 18, 0, 457);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t1);

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*getSelectionLabel, selectedValue*/ 17 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[4](/*value*/ ctx[9]) + "")) div0.innerHTML = raw_value;
    			if (!/*isDisabled*/ ctx[2] && !/*multiFullItemClearable*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*activeSelectedValue, isDisabled*/ 6 && div1_class_value !== (div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[11]
    			? "active"
    			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-1k6n0vy")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(18:0) {#each selectedValue as value, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let each_1_anchor;
    	let each_value = /*selectedValue*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeSelectedValue, isDisabled, multiFullItemClearable, handleClear, getSelectionLabel, selectedValue*/ 63) {
    				each_value = /*selectedValue*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MultiSelection", slots, []);
    	const dispatch = createEventDispatcher();
    	let { selectedValue = [] } = $$props;
    	let { activeSelectedValue = undefined } = $$props;
    	let { isDisabled = false } = $$props;
    	let { multiFullItemClearable = false } = $$props;
    	let { getSelectionLabel = undefined } = $$props;

    	function handleClear(i, event) {
    		event.stopPropagation();
    		dispatch("multiItemClear", { i });
    	}

    	const writable_props = [
    		"selectedValue",
    		"activeSelectedValue",
    		"isDisabled",
    		"multiFullItemClearable",
    		"getSelectionLabel"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiSelection> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, event) => handleClear(i, event);
    	const click_handler_1 = (i, event) => multiFullItemClearable ? handleClear(i, event) : {};

    	$$self.$$set = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("multiFullItemClearable" in $$props) $$invalidate(3, multiFullItemClearable = $$props.multiFullItemClearable);
    		if ("getSelectionLabel" in $$props) $$invalidate(4, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		multiFullItemClearable,
    		getSelectionLabel,
    		handleClear
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
    		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
    		if ("multiFullItemClearable" in $$props) $$invalidate(3, multiFullItemClearable = $$props.multiFullItemClearable);
    		if ("getSelectionLabel" in $$props) $$invalidate(4, getSelectionLabel = $$props.getSelectionLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedValue,
    		activeSelectedValue,
    		isDisabled,
    		multiFullItemClearable,
    		getSelectionLabel,
    		handleClear,
    		click_handler,
    		click_handler_1
    	];
    }

    class MultiSelection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			selectedValue: 0,
    			activeSelectedValue: 1,
    			isDisabled: 2,
    			multiFullItemClearable: 3,
    			getSelectionLabel: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelection",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get selectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeSelectedValue() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeSelectedValue(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiFullItemClearable() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiFullItemClearable(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function isOutOfViewport(elem) {
      const bounding = elem.getBoundingClientRect();
      const out = {};

      out.top = bounding.top < 0;
      out.left = bounding.left < 0;
      out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
      out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
      out.any = out.top || out.left || out.bottom || out.right;

      return out;
    }

    function debounce(func, wait, immediate) {
      let timeout;

      return function executedFunction() {
        let context = this;
        let args = arguments;

        let later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
      };
    }

    /* node_modules/svelte-select/src/ClearIcon.svelte generated by Svelte v3.38.2 */

    const file$b = "node_modules/svelte-select/src/ClearIcon.svelte";

    function create_fragment$c(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124\n    l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
    			add_location(path, file$b, 7, 2, 108);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "-2 -2 50 50");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "role", "presentation");
    			add_location(svg, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ClearIcon", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClearIcon> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ClearIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClearIcon",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* node_modules/svelte-select/src/Select.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$c = "node_modules/svelte-select/src/Select.svelte";

    // (827:2) {#if Icon}
    function create_if_block_7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*iconProps*/ ctx[18]];
    	var switch_value = /*Icon*/ ctx[17];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*iconProps*/ 262144)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*iconProps*/ ctx[18])])
    			: {};

    			if (switch_value !== (switch_value = /*Icon*/ ctx[17])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(827:2) {#if Icon}",
    		ctx
    	});

    	return block;
    }

    // (831:2) {#if isMulti && selectedValue && selectedValue.length > 0}
    function create_if_block_6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*MultiSelection*/ ctx[7];

    	function switch_props(ctx) {
    		return {
    			props: {
    				selectedValue: /*selectedValue*/ ctx[0],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[13],
    				activeSelectedValue: /*activeSelectedValue*/ ctx[25],
    				isDisabled: /*isDisabled*/ ctx[10],
    				multiFullItemClearable: /*multiFullItemClearable*/ ctx[9]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[29]);
    		switch_instance.$on("focus", /*handleFocus*/ ctx[32]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 1) switch_instance_changes.selectedValue = /*selectedValue*/ ctx[0];
    			if (dirty[0] & /*getSelectionLabel*/ 8192) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[13];
    			if (dirty[0] & /*activeSelectedValue*/ 33554432) switch_instance_changes.activeSelectedValue = /*activeSelectedValue*/ ctx[25];
    			if (dirty[0] & /*isDisabled*/ 1024) switch_instance_changes.isDisabled = /*isDisabled*/ ctx[10];
    			if (dirty[0] & /*multiFullItemClearable*/ 512) switch_instance_changes.multiFullItemClearable = /*multiFullItemClearable*/ ctx[9];

    			if (switch_value !== (switch_value = /*MultiSelection*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[29]);
    					switch_instance.$on("focus", /*handleFocus*/ ctx[32]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(831:2) {#if isMulti && selectedValue && selectedValue.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (852:2) {:else}
    function create_else_block_1$1(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[26],
    		{ placeholder: /*placeholderText*/ ctx[28] },
    		{ style: /*inputStyles*/ ctx[15] }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-l63srs", true);
    			add_location(input_1, file$c, 852, 4, 21225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding_1*/ ctx[63](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[32], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler_1*/ ctx[64])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 67108864 && /*_inputAttributes*/ ctx[26],
    				dirty[0] & /*placeholderText*/ 268435456 && { placeholder: /*placeholderText*/ ctx[28] },
    				dirty[0] & /*inputStyles*/ 32768 && { style: /*inputStyles*/ ctx[15] }
    			]));

    			if (dirty[0] & /*filterText*/ 2 && input_1.value !== /*filterText*/ ctx[1]) {
    				set_input_value(input_1, /*filterText*/ ctx[1]);
    			}

    			toggle_class(input_1, "svelte-l63srs", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding_1*/ ctx[63](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(852:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (843:2) {#if isDisabled}
    function create_if_block_5$1(ctx) {
    	let input_1;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*_inputAttributes*/ ctx[26],
    		{ placeholder: /*placeholderText*/ ctx[28] },
    		{ style: /*inputStyles*/ ctx[15] },
    		{ disabled: true }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-l63srs", true);
    			add_location(input_1, file$c, 843, 4, 21013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			/*input_1_binding*/ ctx[61](input_1);
    			set_input_value(input_1, /*filterText*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "focus", /*handleFocus*/ ctx[32], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[62])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*_inputAttributes*/ 67108864 && /*_inputAttributes*/ ctx[26],
    				dirty[0] & /*placeholderText*/ 268435456 && { placeholder: /*placeholderText*/ ctx[28] },
    				dirty[0] & /*inputStyles*/ 32768 && { style: /*inputStyles*/ ctx[15] },
    				{ disabled: true }
    			]));

    			if (dirty[0] & /*filterText*/ 2 && input_1.value !== /*filterText*/ ctx[1]) {
    				set_input_value(input_1, /*filterText*/ ctx[1]);
    			}

    			toggle_class(input_1, "svelte-l63srs", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding*/ ctx[61](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(843:2) {#if isDisabled}",
    		ctx
    	});

    	return block;
    }

    // (862:2) {#if !isMulti && showSelectedItem}
    function create_if_block_4$1(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*Selection*/ ctx[6];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*selectedValue*/ ctx[0],
    				getSelectionLabel: /*getSelectionLabel*/ ctx[13]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "selectedItem svelte-l63srs");
    			add_location(div, file$c, 862, 4, 21458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "focus", /*handleFocus*/ ctx[32], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*selectedValue*/ 1) switch_instance_changes.item = /*selectedValue*/ ctx[0];
    			if (dirty[0] & /*getSelectionLabel*/ 8192) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[13];

    			if (switch_value !== (switch_value = /*Selection*/ ctx[6])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(862:2) {#if !isMulti && showSelectedItem}",
    		ctx
    	});

    	return block;
    }

    // (871:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}
    function create_if_block_3$3(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*ClearIcon*/ ctx[23];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "clearSelect svelte-l63srs");
    			add_location(div, file$c, 871, 4, 21710);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", prevent_default(/*handleClear*/ ctx[24]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*ClearIcon*/ ctx[23])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(871:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}",
    		ctx
    	});

    	return block;
    }

    // (877:2) {#if showIndicator || (showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}
    function create_if_block_1$4(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*indicatorSvg*/ ctx[22]) return create_if_block_2$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "indicator svelte-l63srs");
    			add_location(div, file$c, 877, 4, 22009);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(877:2) {#if showIndicator || (showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}",
    		ctx
    	});

    	return block;
    }

    // (881:6) {:else}
    function create_else_block$2(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747\n            3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0\n            1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502\n            0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0\n            0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
    			add_location(path, file$c, 886, 10, 22230);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "class", "svelte-l63srs");
    			add_location(svg, file$c, 881, 8, 22109);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(881:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (879:6) {#if indicatorSvg}
    function create_if_block_2$3(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*indicatorSvg*/ ctx[22], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*indicatorSvg*/ 4194304) html_tag.p(/*indicatorSvg*/ ctx[22]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(879:6) {#if indicatorSvg}",
    		ctx
    	});

    	return block;
    }

    // (898:2) {#if isWaiting}
    function create_if_block$7(ctx) {
    	let div;
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "spinner_path svelte-l63srs");
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", "currentColor");
    			attr_dev(circle, "stroke-width", "5");
    			attr_dev(circle, "stroke-miterlimit", "10");
    			add_location(circle, file$c, 900, 8, 22735);
    			attr_dev(svg, "class", "spinner_icon svelte-l63srs");
    			attr_dev(svg, "viewBox", "25 25 50 50");
    			add_location(svg, file$c, 899, 6, 22678);
    			attr_dev(div, "class", "spinner svelte-l63srs");
    			add_location(div, file$c, 898, 4, 22650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(898:2) {#if isWaiting}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*Icon*/ ctx[17] && create_if_block_7(ctx);
    	let if_block1 = /*isMulti*/ ctx[8] && /*selectedValue*/ ctx[0] && /*selectedValue*/ ctx[0].length > 0 && create_if_block_6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*isDisabled*/ ctx[10]) return create_if_block_5$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = !/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[27] && create_if_block_4$1(ctx);
    	let if_block4 = /*showSelectedItem*/ ctx[27] && /*isClearable*/ ctx[16] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5] && create_if_block_3$3(ctx);
    	let if_block5 = (/*showIndicator*/ ctx[20] || (/*showChevron*/ ctx[19] && !/*selectedValue*/ ctx[0] || !/*isSearchable*/ ctx[14] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[27] && !/*isClearable*/ ctx[16] || !/*showSelectedItem*/ ctx[27]))) && create_if_block_1$4(ctx);
    	let if_block6 = /*isWaiting*/ ctx[5] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			attr_dev(div, "class", div_class_value = "selectContainer " + /*containerClasses*/ ctx[21] + " svelte-l63srs");
    			attr_dev(div, "style", /*containerStyles*/ ctx[12]);
    			toggle_class(div, "hasError", /*hasError*/ ctx[11]);
    			toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			toggle_class(div, "disabled", /*isDisabled*/ ctx[10]);
    			toggle_class(div, "focused", /*isFocused*/ ctx[4]);
    			add_location(div, file$c, 816, 0, 20359);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t3);
    			if (if_block4) if_block4.m(div, null);
    			append_dev(div, t4);
    			if (if_block5) if_block5.m(div, null);
    			append_dev(div, t5);
    			if (if_block6) if_block6.m(div, null);
    			/*div_binding*/ ctx[65](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*handleWindowClick*/ ctx[33], false, false, false),
    					listen_dev(window, "keydown", /*handleKeyDown*/ ctx[31], false, false, false),
    					listen_dev(window, "resize", /*getPosition*/ ctx[30], false, false, false),
    					listen_dev(div, "click", /*handleClick*/ ctx[34], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Icon*/ ctx[17]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*Icon*/ 131072) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*isMulti*/ ctx[8] && /*selectedValue*/ ctx[0] && /*selectedValue*/ ctx[0].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, selectedValue*/ 257) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div, t2);
    				}
    			}

    			if (!/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[27]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*isMulti, showSelectedItem*/ 134217984) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_4$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t3);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*showSelectedItem*/ ctx[27] && /*isClearable*/ ctx[16] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*showSelectedItem, isClearable, isDisabled, isWaiting*/ 134284320) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_3$3(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div, t4);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*showIndicator*/ ctx[20] || (/*showChevron*/ ctx[19] && !/*selectedValue*/ ctx[0] || !/*isSearchable*/ ctx[14] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[27] && !/*isClearable*/ ctx[16] || !/*showSelectedItem*/ ctx[27]))) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_1$4(ctx);
    					if_block5.c();
    					if_block5.m(div, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*isWaiting*/ ctx[5]) {
    				if (if_block6) ; else {
    					if_block6 = create_if_block$7(ctx);
    					if_block6.c();
    					if_block6.m(div, null);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (!current || dirty[0] & /*containerClasses*/ 2097152 && div_class_value !== (div_class_value = "selectContainer " + /*containerClasses*/ ctx[21] + " svelte-l63srs")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*containerStyles*/ 4096) {
    				attr_dev(div, "style", /*containerStyles*/ ctx[12]);
    			}

    			if (dirty[0] & /*containerClasses, hasError*/ 2099200) {
    				toggle_class(div, "hasError", /*hasError*/ ctx[11]);
    			}

    			if (dirty[0] & /*containerClasses, isMulti*/ 2097408) {
    				toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
    			}

    			if (dirty[0] & /*containerClasses, isDisabled*/ 2098176) {
    				toggle_class(div, "disabled", /*isDisabled*/ ctx[10]);
    			}

    			if (dirty[0] & /*containerClasses, isFocused*/ 2097168) {
    				toggle_class(div, "focused", /*isFocused*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			/*div_binding*/ ctx[65](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let disabled;
    	let showSelectedItem;
    	let placeholderText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, []);
    	const dispatch = createEventDispatcher();
    	let { container = undefined } = $$props;
    	let { input = undefined } = $$props;
    	let { Item: Item$1 = Item } = $$props;
    	let { Selection: Selection$1 = Selection } = $$props;
    	let { MultiSelection: MultiSelection$1 = MultiSelection } = $$props;
    	let { isMulti = false } = $$props;
    	let { multiFullItemClearable = false } = $$props;
    	let { isDisabled = false } = $$props;
    	let { isCreatable = false } = $$props;
    	let { isFocused = false } = $$props;
    	let { selectedValue = undefined } = $$props;
    	let { filterText = "" } = $$props;
    	let { placeholder = "Select..." } = $$props;
    	let { items = [] } = $$props;
    	let { itemFilter = (label, filterText, option) => label.toLowerCase().includes(filterText.toLowerCase()) } = $$props;
    	let { groupBy = undefined } = $$props;
    	let { groupFilter = groups => groups } = $$props;
    	let { isGroupHeaderSelectable = false } = $$props;

    	let { getGroupHeaderLabel = option => {
    		return option.label;
    	} } = $$props;

    	let { getOptionLabel = (option, filterText) => {
    		return option.isCreator
    		? `Create \"${filterText}\"`
    		: option.label;
    	} } = $$props;

    	let { optionIdentifier = "value" } = $$props;
    	let { loadOptions = undefined } = $$props;
    	let { hasError = false } = $$props;
    	let { containerStyles = "" } = $$props;

    	let { getSelectionLabel = option => {
    		if (option) return option.label;
    	} } = $$props;

    	let { createGroupHeaderItem = groupValue => {
    		return { value: groupValue, label: groupValue };
    	} } = $$props;

    	let { createItem = filterText => {
    		return { value: filterText, label: filterText };
    	} } = $$props;

    	let { isSearchable = true } = $$props;
    	let { inputStyles = "" } = $$props;
    	let { isClearable = true } = $$props;
    	let { isWaiting = false } = $$props;
    	let { listPlacement = "auto" } = $$props;
    	let { listOpen = false } = $$props;
    	let { list = undefined } = $$props;
    	let { isVirtualList = false } = $$props;
    	let { loadOptionsInterval = 300 } = $$props;
    	let { noOptionsMessage = "No options" } = $$props;
    	let { hideEmptyState = false } = $$props;
    	let { filteredItems = [] } = $$props;
    	let { inputAttributes = {} } = $$props;
    	let { listAutoWidth = true } = $$props;
    	let { itemHeight = 40 } = $$props;
    	let { Icon = undefined } = $$props;
    	let { iconProps = {} } = $$props;
    	let { showChevron = false } = $$props;
    	let { showIndicator = false } = $$props;
    	let { containerClasses = "" } = $$props;
    	let { indicatorSvg = undefined } = $$props;
    	let { ClearIcon: ClearIcon$1 = ClearIcon } = $$props;
    	let target;
    	let activeSelectedValue;
    	let _items = [];
    	let originalItemsClone;
    	let prev_selectedValue;
    	let prev_listOpen;
    	let prev_filterText;
    	let prev_isFocused;
    	let prev_filteredItems;

    	async function resetFilter() {
    		await tick();
    		$$invalidate(1, filterText = "");
    	}

    	let getItemsHasInvoked = false;

    	const getItems = debounce(
    		async () => {
    			getItemsHasInvoked = true;
    			$$invalidate(5, isWaiting = true);

    			let res = await loadOptions(filterText).catch(err => {
    				console.warn("svelte-select loadOptions error :>> ", err);
    				dispatch("error", { type: "loadOptions", details: err });
    			});

    			if (res && !res.cancelled) {
    				if (res) {
    					$$invalidate(35, items = [...res]);
    					dispatch("loaded", { items });
    				} else {
    					$$invalidate(35, items = []);
    				}

    				$$invalidate(5, isWaiting = false);
    				$$invalidate(4, isFocused = true);
    				$$invalidate(37, listOpen = true);
    			}
    		},
    		loadOptionsInterval
    	);

    	let _inputAttributes = {};

    	beforeUpdate(() => {
    		if (isMulti && selectedValue && selectedValue.length > 1) {
    			checkSelectedValueForDuplicates();
    		}

    		if (!isMulti && selectedValue && prev_selectedValue !== selectedValue) {
    			if (!prev_selectedValue || JSON.stringify(selectedValue[optionIdentifier]) !== JSON.stringify(prev_selectedValue[optionIdentifier])) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (isMulti && JSON.stringify(selectedValue) !== JSON.stringify(prev_selectedValue)) {
    			if (checkSelectedValueForDuplicates()) {
    				dispatch("select", selectedValue);
    			}
    		}

    		if (container && listOpen !== prev_listOpen) {
    			if (listOpen) {
    				loadList();
    			} else {
    				removeList();
    			}
    		}

    		if (filterText !== prev_filterText) {
    			if (filterText.length > 0) {
    				$$invalidate(4, isFocused = true);
    				$$invalidate(37, listOpen = true);

    				if (loadOptions) {
    					getItems();
    				} else {
    					loadList();
    					$$invalidate(37, listOpen = true);

    					if (isMulti) {
    						$$invalidate(25, activeSelectedValue = undefined);
    					}
    				}
    			} else {
    				setList([]);
    			}

    			if (list) {
    				list.$set({ filterText });
    			}
    		}

    		if (isFocused !== prev_isFocused) {
    			if (isFocused || listOpen) {
    				handleFocus();
    			} else {
    				resetFilter();
    				if (input) input.blur();
    			}
    		}

    		if (prev_filteredItems !== filteredItems) {
    			let _filteredItems = [...filteredItems];

    			if (isCreatable && filterText) {
    				const itemToCreate = createItem(filterText);
    				itemToCreate.isCreator = true;

    				const existingItemWithFilterValue = _filteredItems.find(item => {
    					return item[optionIdentifier] === itemToCreate[optionIdentifier];
    				});

    				let existingSelectionWithFilterValue;

    				if (selectedValue) {
    					if (isMulti) {
    						existingSelectionWithFilterValue = selectedValue.find(selection => {
    							return selection[optionIdentifier] === itemToCreate[optionIdentifier];
    						});
    					} else if (selectedValue[optionIdentifier] === itemToCreate[optionIdentifier]) {
    						existingSelectionWithFilterValue = selectedValue;
    					}
    				}

    				if (!existingItemWithFilterValue && !existingSelectionWithFilterValue) {
    					_filteredItems = [..._filteredItems, itemToCreate];
    				}
    			}

    			setList(_filteredItems);
    		}

    		prev_selectedValue = selectedValue;
    		prev_listOpen = listOpen;
    		prev_filterText = filterText;
    		prev_isFocused = isFocused;
    		prev_filteredItems = filteredItems;
    	});

    	function checkSelectedValueForDuplicates() {
    		let noDuplicates = true;

    		if (selectedValue) {
    			const ids = [];
    			const uniqueValues = [];

    			selectedValue.forEach(val => {
    				if (!ids.includes(val[optionIdentifier])) {
    					ids.push(val[optionIdentifier]);
    					uniqueValues.push(val);
    				} else {
    					noDuplicates = false;
    				}
    			});

    			if (!noDuplicates) $$invalidate(0, selectedValue = uniqueValues);
    		}

    		return noDuplicates;
    	}

    	function findItem(selection) {
    		let matchTo = selection
    		? selection[optionIdentifier]
    		: selectedValue[optionIdentifier];

    		return items.find(item => item[optionIdentifier] === matchTo);
    	}

    	function updateSelectedValueDisplay(items) {
    		if (!items || items.length === 0 || items.some(item => typeof item !== "object")) return;

    		if (!selectedValue || (isMulti
    		? selectedValue.some(selection => !selection || !selection[optionIdentifier])
    		: !selectedValue[optionIdentifier])) return;

    		if (Array.isArray(selectedValue)) {
    			$$invalidate(0, selectedValue = selectedValue.map(selection => findItem(selection) || selection));
    		} else {
    			$$invalidate(0, selectedValue = findItem() || selectedValue);
    		}
    	}

    	async function setList(items) {
    		await tick();
    		if (!listOpen) return;
    		if (list) return list.$set({ items });
    		if (loadOptions && getItemsHasInvoked && items.length > 0) loadList();
    	}

    	function handleMultiItemClear(event) {
    		const { detail } = event;
    		const itemToRemove = selectedValue[detail ? detail.i : selectedValue.length - 1];

    		if (selectedValue.length === 1) {
    			$$invalidate(0, selectedValue = undefined);
    		} else {
    			$$invalidate(0, selectedValue = selectedValue.filter(item => {
    				return item !== itemToRemove;
    			}));
    		}

    		dispatch("clear", itemToRemove);
    		getPosition();
    	}

    	async function getPosition() {
    		await tick();
    		if (!target || !container) return;
    		const { top, height, width } = container.getBoundingClientRect();
    		target.style["min-width"] = `${width}px`;
    		target.style.width = `${listAutoWidth ? "auto" : "100%"}`;
    		target.style.left = "0";

    		if (listPlacement === "top") {
    			target.style.bottom = `${height + 5}px`;
    		} else {
    			target.style.top = `${height + 5}px`;
    		}

    		target = target;

    		if (listPlacement === "auto" && isOutOfViewport(target).bottom) {
    			target.style.top = ``;
    			target.style.bottom = `${height + 5}px`;
    		}

    		target.style.visibility = "";
    	}

    	function handleKeyDown(e) {
    		if (!isFocused) return;

    		switch (e.key) {
    			case "ArrowDown":
    				e.preventDefault();
    				$$invalidate(37, listOpen = true);
    				$$invalidate(25, activeSelectedValue = undefined);
    				break;
    			case "ArrowUp":
    				e.preventDefault();
    				$$invalidate(37, listOpen = true);
    				$$invalidate(25, activeSelectedValue = undefined);
    				break;
    			case "Tab":
    				if (!listOpen) $$invalidate(4, isFocused = false);
    				break;
    			case "Backspace":
    				if (!isMulti || filterText.length > 0) return;
    				if (isMulti && selectedValue && selectedValue.length > 0) {
    					handleMultiItemClear(activeSelectedValue !== undefined
    					? activeSelectedValue
    					: selectedValue.length - 1);

    					if (activeSelectedValue === 0 || activeSelectedValue === undefined) break;

    					$$invalidate(25, activeSelectedValue = selectedValue.length > activeSelectedValue
    					? activeSelectedValue - 1
    					: undefined);
    				}
    				break;
    			case "ArrowLeft":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0) return;
    				if (activeSelectedValue === undefined) {
    					$$invalidate(25, activeSelectedValue = selectedValue.length - 1);
    				} else if (selectedValue.length > activeSelectedValue && activeSelectedValue !== 0) {
    					$$invalidate(25, activeSelectedValue -= 1);
    				}
    				break;
    			case "ArrowRight":
    				if (list) list.$set({ hoverItemIndex: -1 });
    				if (!isMulti || filterText.length > 0 || activeSelectedValue === undefined) return;
    				if (activeSelectedValue === selectedValue.length - 1) {
    					$$invalidate(25, activeSelectedValue = undefined);
    				} else if (activeSelectedValue < selectedValue.length - 1) {
    					$$invalidate(25, activeSelectedValue += 1);
    				}
    				break;
    		}
    	}

    	function handleFocus() {
    		$$invalidate(4, isFocused = true);
    		if (input) input.focus();
    	}

    	function removeList() {
    		resetFilter();
    		$$invalidate(25, activeSelectedValue = undefined);
    		if (!list) return;
    		list.$destroy();
    		$$invalidate(36, list = undefined);
    		if (!target) return;
    		if (target.parentNode) target.parentNode.removeChild(target);
    		target = undefined;
    		$$invalidate(36, list);
    		target = target;
    	}

    	function handleWindowClick(event) {
    		if (!container) return;

    		const eventTarget = event.path && event.path.length > 0
    		? event.path[0]
    		: event.target;

    		if (container.contains(eventTarget)) return;
    		$$invalidate(4, isFocused = false);
    		$$invalidate(37, listOpen = false);
    		$$invalidate(25, activeSelectedValue = undefined);
    		if (input) input.blur();
    	}

    	function handleClick() {
    		if (isDisabled) return;
    		$$invalidate(4, isFocused = true);
    		$$invalidate(37, listOpen = !listOpen);
    	}

    	function handleClear() {
    		$$invalidate(0, selectedValue = undefined);
    		$$invalidate(37, listOpen = false);
    		dispatch("clear", selectedValue);
    		handleFocus();
    	}

    	async function loadList() {
    		await tick();
    		if (target && list) return;

    		const data = {
    			Item: Item$1,
    			filterText,
    			optionIdentifier,
    			noOptionsMessage,
    			hideEmptyState,
    			isVirtualList,
    			selectedValue,
    			isMulti,
    			getGroupHeaderLabel,
    			items: filteredItems,
    			itemHeight
    		};

    		if (getOptionLabel) {
    			data.getOptionLabel = getOptionLabel;
    		}

    		target = document.createElement("div");

    		Object.assign(target.style, {
    			position: "absolute",
    			"z-index": 2,
    			visibility: "hidden"
    		});

    		$$invalidate(36, list);
    		target = target;
    		if (container) container.appendChild(target);
    		$$invalidate(36, list = new List({ target, props: data }));

    		list.$on("itemSelected", event => {
    			const { detail } = event;

    			if (detail) {
    				const item = Object.assign({}, detail);

    				if (!item.isGroupHeader || item.isSelectable) {
    					if (isMulti) {
    						$$invalidate(0, selectedValue = selectedValue ? selectedValue.concat([item]) : [item]);
    					} else {
    						$$invalidate(0, selectedValue = item);
    					}

    					resetFilter();
    					(($$invalidate(0, selectedValue), $$invalidate(48, optionIdentifier)), $$invalidate(8, isMulti));

    					setTimeout(() => {
    						$$invalidate(37, listOpen = false);
    						$$invalidate(25, activeSelectedValue = undefined);
    					});
    				}
    			}
    		});

    		list.$on("itemCreated", event => {
    			const { detail } = event;

    			if (isMulti) {
    				$$invalidate(0, selectedValue = selectedValue || []);
    				$$invalidate(0, selectedValue = [...selectedValue, createItem(detail)]);
    			} else {
    				$$invalidate(0, selectedValue = createItem(detail));
    			}

    			dispatch("itemCreated", detail);
    			$$invalidate(1, filterText = "");
    			$$invalidate(37, listOpen = false);
    			$$invalidate(25, activeSelectedValue = undefined);
    			resetFilter();
    		});

    		list.$on("closeList", () => {
    			$$invalidate(37, listOpen = false);
    		});

    		($$invalidate(36, list), target = target);
    		getPosition();
    	}

    	onMount(() => {
    		if (isFocused) input.focus();
    		if (listOpen) loadList();

    		if (items && items.length > 0) {
    			$$invalidate(60, originalItemsClone = JSON.stringify(items));
    		}
    	});

    	onDestroy(() => {
    		removeList();
    	});

    	const writable_props = [
    		"container",
    		"input",
    		"Item",
    		"Selection",
    		"MultiSelection",
    		"isMulti",
    		"multiFullItemClearable",
    		"isDisabled",
    		"isCreatable",
    		"isFocused",
    		"selectedValue",
    		"filterText",
    		"placeholder",
    		"items",
    		"itemFilter",
    		"groupBy",
    		"groupFilter",
    		"isGroupHeaderSelectable",
    		"getGroupHeaderLabel",
    		"getOptionLabel",
    		"optionIdentifier",
    		"loadOptions",
    		"hasError",
    		"containerStyles",
    		"getSelectionLabel",
    		"createGroupHeaderItem",
    		"createItem",
    		"isSearchable",
    		"inputStyles",
    		"isClearable",
    		"isWaiting",
    		"listPlacement",
    		"listOpen",
    		"list",
    		"isVirtualList",
    		"loadOptionsInterval",
    		"noOptionsMessage",
    		"hideEmptyState",
    		"filteredItems",
    		"inputAttributes",
    		"listAutoWidth",
    		"itemHeight",
    		"Icon",
    		"iconProps",
    		"showChevron",
    		"showIndicator",
    		"containerClasses",
    		"indicatorSvg",
    		"ClearIcon"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(3, input);
    		});
    	}

    	function input_1_input_handler() {
    		filterText = this.value;
    		$$invalidate(1, filterText);
    	}

    	function input_1_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(3, input);
    		});
    	}

    	function input_1_input_handler_1() {
    		filterText = this.value;
    		$$invalidate(1, filterText);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(2, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("container" in $$props) $$invalidate(2, container = $$props.container);
    		if ("input" in $$props) $$invalidate(3, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(39, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("multiFullItemClearable" in $$props) $$invalidate(9, multiFullItemClearable = $$props.multiFullItemClearable);
    		if ("isDisabled" in $$props) $$invalidate(10, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(40, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(4, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(1, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(41, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(35, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(42, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(43, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(44, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(45, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(46, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(47, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(48, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(49, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(11, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(12, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(13, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(50, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(51, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(14, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(15, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(16, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(52, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(37, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(36, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(53, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(54, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(55, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(56, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(38, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(57, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(58, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(59, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(17, Icon = $$props.Icon);
    		if ("iconProps" in $$props) $$invalidate(18, iconProps = $$props.iconProps);
    		if ("showChevron" in $$props) $$invalidate(19, showChevron = $$props.showChevron);
    		if ("showIndicator" in $$props) $$invalidate(20, showIndicator = $$props.showIndicator);
    		if ("containerClasses" in $$props) $$invalidate(21, containerClasses = $$props.containerClasses);
    		if ("indicatorSvg" in $$props) $$invalidate(22, indicatorSvg = $$props.indicatorSvg);
    		if ("ClearIcon" in $$props) $$invalidate(23, ClearIcon$1 = $$props.ClearIcon);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		List,
    		ItemComponent: Item,
    		SelectionComponent: Selection,
    		MultiSelectionComponent: MultiSelection,
    		isOutOfViewport,
    		debounce,
    		DefaultClearIcon: ClearIcon,
    		dispatch,
    		container,
    		input,
    		Item: Item$1,
    		Selection: Selection$1,
    		MultiSelection: MultiSelection$1,
    		isMulti,
    		multiFullItemClearable,
    		isDisabled,
    		isCreatable,
    		isFocused,
    		selectedValue,
    		filterText,
    		placeholder,
    		items,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		createGroupHeaderItem,
    		createItem,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		isWaiting,
    		listPlacement,
    		listOpen,
    		list,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		filteredItems,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		Icon,
    		iconProps,
    		showChevron,
    		showIndicator,
    		containerClasses,
    		indicatorSvg,
    		ClearIcon: ClearIcon$1,
    		target,
    		activeSelectedValue,
    		_items,
    		originalItemsClone,
    		prev_selectedValue,
    		prev_listOpen,
    		prev_filterText,
    		prev_isFocused,
    		prev_filteredItems,
    		resetFilter,
    		getItemsHasInvoked,
    		getItems,
    		_inputAttributes,
    		checkSelectedValueForDuplicates,
    		findItem,
    		updateSelectedValueDisplay,
    		setList,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		removeList,
    		handleWindowClick,
    		handleClick,
    		handleClear,
    		loadList,
    		disabled,
    		showSelectedItem,
    		placeholderText
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(2, container = $$props.container);
    		if ("input" in $$props) $$invalidate(3, input = $$props.input);
    		if ("Item" in $$props) $$invalidate(39, Item$1 = $$props.Item);
    		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
    		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
    		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
    		if ("multiFullItemClearable" in $$props) $$invalidate(9, multiFullItemClearable = $$props.multiFullItemClearable);
    		if ("isDisabled" in $$props) $$invalidate(10, isDisabled = $$props.isDisabled);
    		if ("isCreatable" in $$props) $$invalidate(40, isCreatable = $$props.isCreatable);
    		if ("isFocused" in $$props) $$invalidate(4, isFocused = $$props.isFocused);
    		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
    		if ("filterText" in $$props) $$invalidate(1, filterText = $$props.filterText);
    		if ("placeholder" in $$props) $$invalidate(41, placeholder = $$props.placeholder);
    		if ("items" in $$props) $$invalidate(35, items = $$props.items);
    		if ("itemFilter" in $$props) $$invalidate(42, itemFilter = $$props.itemFilter);
    		if ("groupBy" in $$props) $$invalidate(43, groupBy = $$props.groupBy);
    		if ("groupFilter" in $$props) $$invalidate(44, groupFilter = $$props.groupFilter);
    		if ("isGroupHeaderSelectable" in $$props) $$invalidate(45, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
    		if ("getGroupHeaderLabel" in $$props) $$invalidate(46, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
    		if ("getOptionLabel" in $$props) $$invalidate(47, getOptionLabel = $$props.getOptionLabel);
    		if ("optionIdentifier" in $$props) $$invalidate(48, optionIdentifier = $$props.optionIdentifier);
    		if ("loadOptions" in $$props) $$invalidate(49, loadOptions = $$props.loadOptions);
    		if ("hasError" in $$props) $$invalidate(11, hasError = $$props.hasError);
    		if ("containerStyles" in $$props) $$invalidate(12, containerStyles = $$props.containerStyles);
    		if ("getSelectionLabel" in $$props) $$invalidate(13, getSelectionLabel = $$props.getSelectionLabel);
    		if ("createGroupHeaderItem" in $$props) $$invalidate(50, createGroupHeaderItem = $$props.createGroupHeaderItem);
    		if ("createItem" in $$props) $$invalidate(51, createItem = $$props.createItem);
    		if ("isSearchable" in $$props) $$invalidate(14, isSearchable = $$props.isSearchable);
    		if ("inputStyles" in $$props) $$invalidate(15, inputStyles = $$props.inputStyles);
    		if ("isClearable" in $$props) $$invalidate(16, isClearable = $$props.isClearable);
    		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
    		if ("listPlacement" in $$props) $$invalidate(52, listPlacement = $$props.listPlacement);
    		if ("listOpen" in $$props) $$invalidate(37, listOpen = $$props.listOpen);
    		if ("list" in $$props) $$invalidate(36, list = $$props.list);
    		if ("isVirtualList" in $$props) $$invalidate(53, isVirtualList = $$props.isVirtualList);
    		if ("loadOptionsInterval" in $$props) $$invalidate(54, loadOptionsInterval = $$props.loadOptionsInterval);
    		if ("noOptionsMessage" in $$props) $$invalidate(55, noOptionsMessage = $$props.noOptionsMessage);
    		if ("hideEmptyState" in $$props) $$invalidate(56, hideEmptyState = $$props.hideEmptyState);
    		if ("filteredItems" in $$props) $$invalidate(38, filteredItems = $$props.filteredItems);
    		if ("inputAttributes" in $$props) $$invalidate(57, inputAttributes = $$props.inputAttributes);
    		if ("listAutoWidth" in $$props) $$invalidate(58, listAutoWidth = $$props.listAutoWidth);
    		if ("itemHeight" in $$props) $$invalidate(59, itemHeight = $$props.itemHeight);
    		if ("Icon" in $$props) $$invalidate(17, Icon = $$props.Icon);
    		if ("iconProps" in $$props) $$invalidate(18, iconProps = $$props.iconProps);
    		if ("showChevron" in $$props) $$invalidate(19, showChevron = $$props.showChevron);
    		if ("showIndicator" in $$props) $$invalidate(20, showIndicator = $$props.showIndicator);
    		if ("containerClasses" in $$props) $$invalidate(21, containerClasses = $$props.containerClasses);
    		if ("indicatorSvg" in $$props) $$invalidate(22, indicatorSvg = $$props.indicatorSvg);
    		if ("ClearIcon" in $$props) $$invalidate(23, ClearIcon$1 = $$props.ClearIcon);
    		if ("target" in $$props) target = $$props.target;
    		if ("activeSelectedValue" in $$props) $$invalidate(25, activeSelectedValue = $$props.activeSelectedValue);
    		if ("_items" in $$props) $$invalidate(75, _items = $$props._items);
    		if ("originalItemsClone" in $$props) $$invalidate(60, originalItemsClone = $$props.originalItemsClone);
    		if ("prev_selectedValue" in $$props) prev_selectedValue = $$props.prev_selectedValue;
    		if ("prev_listOpen" in $$props) prev_listOpen = $$props.prev_listOpen;
    		if ("prev_filterText" in $$props) prev_filterText = $$props.prev_filterText;
    		if ("prev_isFocused" in $$props) prev_isFocused = $$props.prev_isFocused;
    		if ("prev_filteredItems" in $$props) prev_filteredItems = $$props.prev_filteredItems;
    		if ("getItemsHasInvoked" in $$props) getItemsHasInvoked = $$props.getItemsHasInvoked;
    		if ("_inputAttributes" in $$props) $$invalidate(26, _inputAttributes = $$props._inputAttributes);
    		if ("disabled" in $$props) disabled = $$props.disabled;
    		if ("showSelectedItem" in $$props) $$invalidate(27, showSelectedItem = $$props.showSelectedItem);
    		if ("placeholderText" in $$props) $$invalidate(28, placeholderText = $$props.placeholderText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*isDisabled*/ 1024) {
    			 disabled = isDisabled;
    		}

    		if ($$self.$$.dirty[1] & /*items*/ 16) {
    			 updateSelectedValueDisplay(items);
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, isMulti*/ 257 | $$self.$$.dirty[1] & /*optionIdentifier*/ 131072) {
    			 {
    				if (typeof selectedValue === "string") {
    					$$invalidate(0, selectedValue = {
    						[optionIdentifier]: selectedValue,
    						label: selectedValue
    					});
    				} else if (isMulti && Array.isArray(selectedValue) && selectedValue.length > 0) {
    					$$invalidate(0, selectedValue = selectedValue.map(item => typeof item === "string"
    					? { value: item, label: item }
    					: item));
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*noOptionsMessage, list*/ 16777248) {
    			 {
    				if (noOptionsMessage && list) list.$set({ noOptionsMessage });
    			}
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue, filterText*/ 3) {
    			 $$invalidate(27, showSelectedItem = selectedValue && filterText.length === 0);
    		}

    		if ($$self.$$.dirty[0] & /*selectedValue*/ 1 | $$self.$$.dirty[1] & /*placeholder*/ 1024) {
    			 $$invalidate(28, placeholderText = selectedValue ? "" : placeholder);
    		}

    		if ($$self.$$.dirty[0] & /*isSearchable*/ 16384 | $$self.$$.dirty[1] & /*inputAttributes*/ 67108864) {
    			 {
    				$$invalidate(26, _inputAttributes = Object.assign(
    					{
    						autocomplete: "off",
    						autocorrect: "off",
    						spellcheck: false
    					},
    					inputAttributes
    				));

    				if (!isSearchable) {
    					$$invalidate(26, _inputAttributes.readonly = true, _inputAttributes);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*filterText, isMulti, selectedValue*/ 259 | $$self.$$.dirty[1] & /*items, loadOptions, originalItemsClone, optionIdentifier, itemFilter, getOptionLabel, groupBy, createGroupHeaderItem, isGroupHeaderSelectable, groupFilter*/ 537884688) {
    			 {
    				let _filteredItems;
    				let _items = items;

    				if (items && items.length > 0 && typeof items[0] !== "object") {
    					_items = items.map((item, index) => {
    						return { index, value: item, label: item };
    					});
    				}

    				if (loadOptions && filterText.length === 0 && originalItemsClone) {
    					_filteredItems = JSON.parse(originalItemsClone);
    					_items = JSON.parse(originalItemsClone);
    				} else {
    					_filteredItems = loadOptions
    					? filterText.length === 0 ? [] : _items
    					: _items.filter(item => {
    							let keepItem = true;

    							if (isMulti && selectedValue) {
    								keepItem = !selectedValue.some(value => {
    									return value[optionIdentifier] === item[optionIdentifier];
    								});
    							}

    							if (!keepItem) return false;
    							if (filterText.length < 1) return true;
    							return itemFilter(getOptionLabel(item, filterText), filterText, item);
    						});
    				}

    				if (groupBy) {
    					const groupValues = [];
    					const groups = {};

    					_filteredItems.forEach(item => {
    						const groupValue = groupBy(item);

    						if (!groupValues.includes(groupValue)) {
    							groupValues.push(groupValue);
    							groups[groupValue] = [];

    							if (groupValue) {
    								groups[groupValue].push(Object.assign(createGroupHeaderItem(groupValue, item), {
    									id: groupValue,
    									isGroupHeader: true,
    									isSelectable: isGroupHeaderSelectable
    								}));
    							}
    						}

    						groups[groupValue].push(Object.assign({ isGroupItem: !!groupValue }, item));
    					});

    					const sortedGroupedItems = [];

    					groupFilter(groupValues).forEach(groupValue => {
    						sortedGroupedItems.push(...groups[groupValue]);
    					});

    					$$invalidate(38, filteredItems = sortedGroupedItems);
    				} else {
    					$$invalidate(38, filteredItems = _filteredItems);
    				}
    			}
    		}
    	};

    	return [
    		selectedValue,
    		filterText,
    		container,
    		input,
    		isFocused,
    		isWaiting,
    		Selection$1,
    		MultiSelection$1,
    		isMulti,
    		multiFullItemClearable,
    		isDisabled,
    		hasError,
    		containerStyles,
    		getSelectionLabel,
    		isSearchable,
    		inputStyles,
    		isClearable,
    		Icon,
    		iconProps,
    		showChevron,
    		showIndicator,
    		containerClasses,
    		indicatorSvg,
    		ClearIcon$1,
    		handleClear,
    		activeSelectedValue,
    		_inputAttributes,
    		showSelectedItem,
    		placeholderText,
    		handleMultiItemClear,
    		getPosition,
    		handleKeyDown,
    		handleFocus,
    		handleWindowClick,
    		handleClick,
    		items,
    		list,
    		listOpen,
    		filteredItems,
    		Item$1,
    		isCreatable,
    		placeholder,
    		itemFilter,
    		groupBy,
    		groupFilter,
    		isGroupHeaderSelectable,
    		getGroupHeaderLabel,
    		getOptionLabel,
    		optionIdentifier,
    		loadOptions,
    		createGroupHeaderItem,
    		createItem,
    		listPlacement,
    		isVirtualList,
    		loadOptionsInterval,
    		noOptionsMessage,
    		hideEmptyState,
    		inputAttributes,
    		listAutoWidth,
    		itemHeight,
    		originalItemsClone,
    		input_1_binding,
    		input_1_input_handler,
    		input_1_binding_1,
    		input_1_input_handler_1,
    		div_binding
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$d,
    			create_fragment$d,
    			safe_not_equal,
    			{
    				container: 2,
    				input: 3,
    				Item: 39,
    				Selection: 6,
    				MultiSelection: 7,
    				isMulti: 8,
    				multiFullItemClearable: 9,
    				isDisabled: 10,
    				isCreatable: 40,
    				isFocused: 4,
    				selectedValue: 0,
    				filterText: 1,
    				placeholder: 41,
    				items: 35,
    				itemFilter: 42,
    				groupBy: 43,
    				groupFilter: 44,
    				isGroupHeaderSelectable: 45,
    				getGroupHeaderLabel: 46,
    				getOptionLabel: 47,
    				optionIdentifier: 48,
    				loadOptions: 49,
    				hasError: 11,
    				containerStyles: 12,
    				getSelectionLabel: 13,
    				createGroupHeaderItem: 50,
    				createItem: 51,
    				isSearchable: 14,
    				inputStyles: 15,
    				isClearable: 16,
    				isWaiting: 5,
    				listPlacement: 52,
    				listOpen: 37,
    				list: 36,
    				isVirtualList: 53,
    				loadOptionsInterval: 54,
    				noOptionsMessage: 55,
    				hideEmptyState: 56,
    				filteredItems: 38,
    				inputAttributes: 57,
    				listAutoWidth: 58,
    				itemHeight: 59,
    				Icon: 17,
    				iconProps: 18,
    				showChevron: 19,
    				showIndicator: 20,
    				containerClasses: 21,
    				indicatorSvg: 22,
    				ClearIcon: 23,
    				handleClear: 24
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get container() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set container(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get input() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set input(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Item() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Item(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Selection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Selection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get MultiSelection() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set MultiSelection(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMulti() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMulti(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiFullItemClearable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiFullItemClearable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isCreatable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isCreatable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocused() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedValue() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedValue(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterText() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterText(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupBy() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupBy(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupFilter() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupFilter(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isGroupHeaderSelectable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isGroupHeaderSelectable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getGroupHeaderLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getGroupHeaderLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getOptionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optionIdentifier() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optionIdentifier(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptions() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptions(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasError() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasError(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectionLabel() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getSelectionLabel(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createGroupHeaderItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createGroupHeaderItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get createItem() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set createItem(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSearchable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSearchable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputStyles() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputStyles(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isClearable() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isClearable(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isWaiting() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isWaiting(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listPlacement() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listPlacement(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listOpen() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listOpen(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVirtualList() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVirtualList(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loadOptionsInterval() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loadOptionsInterval(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noOptionsMessage() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noOptionsMessage(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideEmptyState() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideEmptyState(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filteredItems() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filteredItems(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputAttributes() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputAttributes(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listAutoWidth() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listAutoWidth(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemHeight() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemHeight(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Icon() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Icon(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconProps() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconProps(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showChevron() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showChevron(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showIndicator() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showIndicator(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerClasses() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerClasses(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indicatorSvg() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indicatorSvg(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ClearIcon() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ClearIcon(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClear() {
    		return this.$$.ctx[24];
    	}

    	set handleClear(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Content.svelte generated by Svelte v3.38.2 */
    const file$d = "src/components/Content.svelte";

    // (62:12) {#if description}
    function create_if_block$8(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "description");
    			add_location(div, file$d, 62, 16, 1302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*description*/ ctx[5];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*description*/ 32) div.innerHTML = /*description*/ ctx[5];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(62:12) {#if description}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let section;
    	let div3;
    	let div0;
    	let h1;
    	let t0_value = /*workspace*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let t2;
    	let div2;
    	let div1;
    	let select;
    	let updating_selectedValue;
    	let t3;
    	let rows;
    	let current;
    	let if_block = /*description*/ ctx[5] && create_if_block$8(ctx);

    	function select_selectedValue_binding(value) {
    		/*select_selectedValue_binding*/ ctx[10](value);
    	}

    	let select_props = {
    		items: /*languages*/ ctx[7],
    		isClearable: false,
    		isSearchable: false
    	};

    	if (/*selectedValue*/ ctx[3] !== void 0) {
    		select_props.selectedValue = /*selectedValue*/ ctx[3];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "selectedValue", select_selectedValue_binding));

    	rows = new Rows({
    			props: {
    				content: /*content*/ ctx[4],
    				env: /*env*/ ctx[0],
    				language: /*language*/ ctx[6],
    				cookiejars: /*cookiejars*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(select.$$.fragment);
    			t3 = space();
    			create_component(rows.$$.fragment);
    			add_location(h1, file$d, 60, 12, 1230);
    			attr_dev(div0, "class", "left");
    			add_location(div0, file$d, 59, 8, 1199);
    			attr_dev(div1, "class", "language-selector svelte-1jbhgwi");
    			add_location(div1, file$d, 66, 12, 1426);
    			attr_dev(div2, "class", "right");
    			add_location(div2, file$d, 65, 8, 1394);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$d, 58, 4, 1173);
    			attr_dev(section, "class", "content svelte-1jbhgwi");
    			add_location(section, file$d, 57, 0, 1143);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div0, t1);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(select, div1, null);
    			append_dev(section, t3);
    			mount_component(rows, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*workspace*/ 2) && t0_value !== (t0_value = /*workspace*/ ctx[1].name + "")) set_data_dev(t0, t0_value);

    			if (/*description*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const select_changes = {};

    			if (!updating_selectedValue && dirty & /*selectedValue*/ 8) {
    				updating_selectedValue = true;
    				select_changes.selectedValue = /*selectedValue*/ ctx[3];
    				add_flush_callback(() => updating_selectedValue = false);
    			}

    			select.$set(select_changes);
    			const rows_changes = {};
    			if (dirty & /*content*/ 16) rows_changes.content = /*content*/ ctx[4];
    			if (dirty & /*env*/ 1) rows_changes.env = /*env*/ ctx[0];
    			if (dirty & /*language*/ 64) rows_changes.language = /*language*/ ctx[6];
    			if (dirty & /*cookiejars*/ 4) rows_changes.cookiejars = /*cookiejars*/ ctx[2];
    			rows.$set(rows_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			transition_in(rows.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			transition_out(rows.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block) if_block.d();
    			destroy_component(select);
    			destroy_component(rows);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let content;
    	let description;
    	let language;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Content", slots, []);

    	const markdown = new showdown.Converter({
    			simplifiedAutoLink: true,
    			openLinksInNewWindow: true,
    			excludeTrailingPunctuationFromURLs: true,
    			tables: true
    		});

    	const languages = [
    		{ value: "curl", label: "cURL" },
    		{
    			value: "javascript",
    			label: "JavaScript/Deno (fetch)"
    		},
    		{
    			value: "python",
    			label: "Python (requests)"
    		},
    		{
    			value: "node",
    			label: "Node.js (node-fetch)"
    		},
    		{ value: "ruby", label: "Ruby" },
    		{ value: "php", label: "PHP" },
    		{ value: "golang", label: "Go" }
    	];

    	let { env } = $$props;
    	let { groups } = $$props;
    	let { requests } = $$props;
    	let { workspace } = $$props;
    	let { cookiejars } = $$props;
    	let selectedValue = languages[0];
    	const writable_props = ["env", "groups", "requests", "workspace", "cookiejars"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	function select_selectedValue_binding(value) {
    		selectedValue = value;
    		$$invalidate(3, selectedValue);
    	}

    	$$self.$$set = $$props => {
    		if ("env" in $$props) $$invalidate(0, env = $$props.env);
    		if ("groups" in $$props) $$invalidate(8, groups = $$props.groups);
    		if ("requests" in $$props) $$invalidate(9, requests = $$props.requests);
    		if ("workspace" in $$props) $$invalidate(1, workspace = $$props.workspace);
    		if ("cookiejars" in $$props) $$invalidate(2, cookiejars = $$props.cookiejars);
    	};

    	$$self.$capture_state = () => ({
    		Rows,
    		applyEnv,
    		showdown,
    		Select,
    		markdown,
    		languages,
    		env,
    		groups,
    		requests,
    		workspace,
    		cookiejars,
    		selectedValue,
    		content,
    		description,
    		language
    	});

    	$$self.$inject_state = $$props => {
    		if ("env" in $$props) $$invalidate(0, env = $$props.env);
    		if ("groups" in $$props) $$invalidate(8, groups = $$props.groups);
    		if ("requests" in $$props) $$invalidate(9, requests = $$props.requests);
    		if ("workspace" in $$props) $$invalidate(1, workspace = $$props.workspace);
    		if ("cookiejars" in $$props) $$invalidate(2, cookiejars = $$props.cookiejars);
    		if ("selectedValue" in $$props) $$invalidate(3, selectedValue = $$props.selectedValue);
    		if ("content" in $$props) $$invalidate(4, content = $$props.content);
    		if ("description" in $$props) $$invalidate(5, description = $$props.description);
    		if ("language" in $$props) $$invalidate(6, language = $$props.language);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*groups, requests*/ 768) {
    			 $$invalidate(4, content = [...groups, ...requests]);
    		}

    		if ($$self.$$.dirty & /*workspace, env*/ 3) {
    			 $$invalidate(5, description = workspace.description && markdown.makeHtml(applyEnv(workspace.description, env)));
    		}

    		if ($$self.$$.dirty & /*selectedValue*/ 8) {
    			 $$invalidate(6, language = selectedValue.value);
    		}
    	};

    	return [
    		env,
    		workspace,
    		cookiejars,
    		selectedValue,
    		content,
    		description,
    		language,
    		languages,
    		groups,
    		requests,
    		select_selectedValue_binding
    	];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			env: 0,
    			groups: 8,
    			requests: 9,
    			workspace: 1,
    			cookiejars: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*env*/ ctx[0] === undefined && !("env" in props)) {
    			console.warn("<Content> was created without expected prop 'env'");
    		}

    		if (/*groups*/ ctx[8] === undefined && !("groups" in props)) {
    			console.warn("<Content> was created without expected prop 'groups'");
    		}

    		if (/*requests*/ ctx[9] === undefined && !("requests" in props)) {
    			console.warn("<Content> was created without expected prop 'requests'");
    		}

    		if (/*workspace*/ ctx[1] === undefined && !("workspace" in props)) {
    			console.warn("<Content> was created without expected prop 'workspace'");
    		}

    		if (/*cookiejars*/ ctx[2] === undefined && !("cookiejars" in props)) {
    			console.warn("<Content> was created without expected prop 'cookiejars'");
    		}
    	}

    	get env() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set env(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groups() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groups(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get requests() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set requests(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get workspace() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set workspace(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cookiejars() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cookiejars(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function applyEnvForObject(object, env) {
      let obj = object;
      if (typeof obj === 'object') {
        obj = JSON.parse(JSON.stringify(object));
        replaceObjectValues(obj, env);
      }
      return obj;
    }

    function replaceObjectValues(obj, env) {
      Object.keys(obj).forEach(key => {
        if (obj[key] !== null) {
          switch (typeof obj[key]) {
            case 'object':
              replaceObjectValues(obj[key], env);
              break;
            case 'string':
              obj[key] = applyEnv(obj[key], env);
              break;
          }
        }
      });
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file$e = "src/App.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (58:8) {#each config.environments as environment, idx}
    function create_each_block$7(ctx) {
    	let option;
    	let t_value = /*environment*/ ctx[13].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*idx*/ ctx[15];
    			option.value = option.__value;
    			add_location(option, file$e, 58, 10, 1850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*config*/ 1 && t_value !== (t_value = /*environment*/ ctx[13].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(58:8) {#each config.environments as environment, idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let title_value;
    	let t0;
    	let header;
    	let div1;
    	let span0;
    	let i0;
    	let t1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let img0_alt_value;
    	let t2;
    	let h1;
    	let t3_value = /*config*/ ctx[0].workspace.name + "";
    	let t3;
    	let t4;
    	let div4;
    	let div2;
    	let a;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let div3;
    	let label;
    	let t7;
    	let select;
    	let t8;
    	let span1;
    	let i1;
    	let t9;
    	let section;
    	let sidebar;
    	let t10;
    	let content;
    	let current;
    	let mounted;
    	let dispose;
    	document.title = title_value = /*config*/ ctx[0].workspace.name;
    	let each_value = /*config*/ ctx[0].environments;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	sidebar = new Sidebar({
    			props: {
    				requests: /*requests*/ ctx[6],
    				groups: /*groups*/ ctx[7],
    				workspace: /*config*/ ctx[0].workspace,
    				visible: /*menuVisible*/ ctx[3]
    			},
    			$$inline: true
    		});

    	content = new Content({
    			props: {
    				requests: /*requests*/ ctx[6],
    				groups: /*groups*/ ctx[7],
    				workspace: /*config*/ ctx[0].workspace,
    				cookiejars: /*config*/ ctx[0].cookiejars,
    				env: /*env*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			header = element("header");
    			div1 = element("div");
    			span0 = element("span");
    			i0 = element("i");
    			t1 = space();
    			div0 = element("div");
    			img0 = element("img");
    			t2 = space();
    			h1 = element("h1");
    			t3 = text(t3_value);
    			t4 = space();
    			div4 = element("div");
    			div2 = element("div");
    			a = element("a");
    			img1 = element("img");
    			t5 = space();
    			div3 = element("div");
    			label = element("label");
    			label.textContent = "Environment:";
    			t7 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			span1 = element("span");
    			i1 = element("i");
    			t9 = space();
    			section = element("section");
    			create_component(sidebar.$$.fragment);
    			t10 = space();
    			create_component(content.$$.fragment);
    			attr_dev(i0, "class", "fa fa-bars");
    			attr_dev(i0, "aria-hidden", "true");
    			add_location(i0, file$e, 39, 6, 1223);
    			attr_dev(span0, "class", "hamburger-toggler");
    			add_location(span0, file$e, 38, 4, 1157);
    			if (img0.src !== (img0_src_value = "logo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", img0_alt_value = /*config*/ ctx[0].workspace.name);
    			add_location(img0, file$e, 43, 6, 1309);
    			attr_dev(div0, "class", "logo");
    			add_location(div0, file$e, 42, 4, 1284);
    			attr_dev(h1, "class", "title");
    			add_location(h1, file$e, 46, 4, 1376);
    			attr_dev(div1, "class", "header-left");
    			add_location(div1, file$e, 37, 2, 1127);
    			if (img1.src !== (img1_src_value = "https://insomnia.rest/images/run.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Run in Insomnia");
    			add_location(img1, file$e, 51, 8, 1542);
    			attr_dev(a, "href", /*runInInsomniaLink*/ ctx[8]);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$e, 50, 6, 1489);
    			attr_dev(div2, "class", "run");
    			add_location(div2, file$e, 49, 4, 1465);
    			attr_dev(label, "for", "env");
    			set_style(label, "display", "inline-block");
    			add_location(label, file$e, 55, 6, 1673);
    			attr_dev(select, "id", "env");
    			if (/*envId*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[11].call(select));
    			add_location(select, file$e, 56, 6, 1747);
    			attr_dev(div3, "class", "environment");
    			add_location(div3, file$e, 54, 4, 1641);
    			attr_dev(i1, "class", "fa fa-code");
    			attr_dev(i1, "aria-hidden", "true");
    			add_location(i1, file$e, 68, 6, 2101);
    			attr_dev(span1, "class", "example-toggler");
    			attr_dev(span1, "title", "Toggle request examples");
    			toggle_class(span1, "inactive", !/*exampleVisible*/ ctx[4]);
    			add_location(span1, file$e, 62, 4, 1945);
    			attr_dev(div4, "class", "header-right");
    			add_location(div4, file$e, 48, 2, 1434);
    			set_style(header, "border-top", "6px solid " + (/*color*/ ctx[5] !== null ? /*color*/ ctx[5] : "#6a57d5"));
    			add_location(header, file$e, 36, 0, 1048);
    			attr_dev(section, "class", "wrapper");
    			toggle_class(section, "hide-right", !/*exampleVisible*/ ctx[4]);
    			add_location(section, file$e, 73, 0, 2177);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, span0);
    			append_dev(span0, i0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div1, t2);
    			append_dev(div1, h1);
    			append_dev(h1, t3);
    			append_dev(header, t4);
    			append_dev(header, div4);
    			append_dev(div4, div2);
    			append_dev(div2, a);
    			append_dev(a, img1);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, label);
    			append_dev(div3, t7);
    			append_dev(div3, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*envId*/ ctx[1]);
    			append_dev(div4, t8);
    			append_dev(div4, span1);
    			append_dev(span1, i1);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, section, anchor);
    			mount_component(sidebar, section, null);
    			append_dev(section, t10);
    			mount_component(content, section, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*toggleHamburger*/ ctx[9], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[11]),
    					listen_dev(span1, "click", /*toggleExample*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*config*/ 1) && title_value !== (title_value = /*config*/ ctx[0].workspace.name)) {
    				document.title = title_value;
    			}

    			if (!current || dirty & /*config*/ 1 && img0_alt_value !== (img0_alt_value = /*config*/ ctx[0].workspace.name)) {
    				attr_dev(img0, "alt", img0_alt_value);
    			}

    			if ((!current || dirty & /*config*/ 1) && t3_value !== (t3_value = /*config*/ ctx[0].workspace.name + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*config*/ 1) {
    				each_value = /*config*/ ctx[0].environments;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*envId*/ 2) {
    				select_option(select, /*envId*/ ctx[1]);
    			}

    			if (dirty & /*exampleVisible*/ 16) {
    				toggle_class(span1, "inactive", !/*exampleVisible*/ ctx[4]);
    			}

    			if (!current || dirty & /*color*/ 32) {
    				set_style(header, "border-top", "6px solid " + (/*color*/ ctx[5] !== null ? /*color*/ ctx[5] : "#6a57d5"));
    			}

    			const sidebar_changes = {};
    			if (dirty & /*requests*/ 64) sidebar_changes.requests = /*requests*/ ctx[6];
    			if (dirty & /*groups*/ 128) sidebar_changes.groups = /*groups*/ ctx[7];
    			if (dirty & /*config*/ 1) sidebar_changes.workspace = /*config*/ ctx[0].workspace;
    			if (dirty & /*menuVisible*/ 8) sidebar_changes.visible = /*menuVisible*/ ctx[3];
    			sidebar.$set(sidebar_changes);
    			const content_changes = {};
    			if (dirty & /*requests*/ 64) content_changes.requests = /*requests*/ ctx[6];
    			if (dirty & /*groups*/ 128) content_changes.groups = /*groups*/ ctx[7];
    			if (dirty & /*config*/ 1) content_changes.workspace = /*config*/ ctx[0].workspace;
    			if (dirty & /*config*/ 1) content_changes.cookiejars = /*config*/ ctx[0].cookiejars;
    			if (dirty & /*env*/ 4) content_changes.env = /*env*/ ctx[2];
    			content.$set(content_changes);

    			if (dirty & /*exampleVisible*/ 16) {
    				toggle_class(section, "hide-right", !/*exampleVisible*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(section);
    			destroy_component(sidebar);
    			destroy_component(content);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let env;
    	let color;
    	let requests;
    	let groups;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { config } = $$props;
    	let envId = 0;
    	const jsonUrl = window.location.origin + window.INSOMNIA_URL;
    	const runInInsomniaLink = `https://insomnia.rest/run/?label=${encodeURIComponent(config.workspace.name)}&uri=${encodeURIComponent(jsonUrl)}`;
    	let menuVisible = false;
    	let exampleVisible = (localStorage.getItem("show-examples") || "true") === "true";

    	function toggleHamburger() {
    		$$invalidate(3, menuVisible = !menuVisible);
    	}

    	function toggleExample() {
    		$$invalidate(4, exampleVisible = !exampleVisible);
    		localStorage.setItem("show-examples", exampleVisible);
    	}

    	const writable_props = ["config"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		envId = select_value(this);
    		$$invalidate(1, envId);
    	}

    	$$self.$$set = $$props => {
    		if ("config" in $$props) $$invalidate(0, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({
    		Sidebar,
    		Content,
    		applyEnvForObject,
    		config,
    		envId,
    		jsonUrl,
    		runInInsomniaLink,
    		menuVisible,
    		exampleVisible,
    		toggleHamburger,
    		toggleExample,
    		env,
    		color,
    		requests,
    		groups
    	});

    	$$self.$inject_state = $$props => {
    		if ("config" in $$props) $$invalidate(0, config = $$props.config);
    		if ("envId" in $$props) $$invalidate(1, envId = $$props.envId);
    		if ("menuVisible" in $$props) $$invalidate(3, menuVisible = $$props.menuVisible);
    		if ("exampleVisible" in $$props) $$invalidate(4, exampleVisible = $$props.exampleVisible);
    		if ("env" in $$props) $$invalidate(2, env = $$props.env);
    		if ("color" in $$props) $$invalidate(5, color = $$props.color);
    		if ("requests" in $$props) $$invalidate(6, requests = $$props.requests);
    		if ("groups" in $$props) $$invalidate(7, groups = $$props.groups);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*config, envId*/ 3) {
    			 $$invalidate(2, env = config.environments[envId]);
    		}

    		if ($$self.$$.dirty & /*env*/ 4) {
    			 $$invalidate(5, color = env.color);
    		}

    		if ($$self.$$.dirty & /*config, envId*/ 3) {
    			 $$invalidate(6, requests = applyEnvForObject(config.requests, config.environments[envId]));
    		}

    		if ($$self.$$.dirty & /*config, envId*/ 3) {
    			 $$invalidate(7, groups = applyEnvForObject(config.groups, config.environments[envId]));
    		}
    	};

    	return [
    		config,
    		envId,
    		env,
    		menuVisible,
    		exampleVisible,
    		color,
    		requests,
    		groups,
    		runInInsomniaLink,
    		toggleHamburger,
    		toggleExample,
    		select_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { config: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*config*/ ctx[0] === undefined && !("config" in props)) {
    			console.warn("<App> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ErrorPage.svelte generated by Svelte v3.38.2 */

    const file$f = "src/ErrorPage.svelte";

    function create_fragment$g(ctx) {
    	let t0;
    	let div;
    	let h1;
    	let t2;
    	let p0;
    	let t3;
    	let a;
    	let t4;
    	let a_href_value;
    	let t5;
    	let t6;
    	let p1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Uh-oh!";
    			t2 = space();
    			p0 = element("p");
    			t3 = text("It looks like it's not possible to retrieve the contents of the API documentation\n    at the moment. If you're the owner of this site, make sure that your\n    ");
    			a = element("a");
    			t4 = text("Insomnia JSON file");
    			t5 = text(" is accessible.");
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "The developer console of your browser might have more things to say about this error.";
    			document.title = "Uh-oh!";
    			add_location(h1, file$f, 5, 2, 81);
    			attr_dev(a, "href", a_href_value = window.INSOMNIA_URL);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$f, 9, 4, 266);
    			add_location(p0, file$f, 6, 2, 99);
    			add_location(p1, file$f, 11, 2, 359);
    			attr_dev(div, "class", "error-page svelte-19j2wr5");
    			add_location(div, file$f, 4, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			append_dev(div, p0);
    			append_dev(p0, t3);
    			append_dev(p0, a);
    			append_dev(a, t4);
    			append_dev(p0, t5);
    			append_dev(div, t6);
    			append_dev(div, p1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ErrorPage", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ErrorPage> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ErrorPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ErrorPage",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /**
     * lodash (Custom Build) <https://lodash.com/>
     * Build: `lodash modularize exports="npm" -o ./`
     * Copyright jQuery Foundation and other contributors <https://jquery.org/>
     * Released under MIT license <https://lodash.com/license>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     */

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0,
        MAX_SAFE_INTEGER = 9007199254740991;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        symbolTag = '[object Symbol]';

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array ? array.length : 0,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString = objectProto.toString;

    /** Built-in value references. */
    var Symbol$1 = root.Symbol,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max;

    /**
     * The base implementation of `_.flatten` with support for restricting flattening.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {number} depth The maximum recursion depth.
     * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
     * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
     * @param {Array} [result=[]] The initial result value.
     * @returns {Array} Returns the new flattened array.
     */
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1,
          length = array.length;

      predicate || (predicate = isFlattenable);
      result || (result = []);

      while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            // Recursively flatten arrays (susceptible to call stack limits).
            baseFlatten(value, depth - 1, predicate, isStrict, result);
          } else {
            arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.pick` without support for individual
     * property identifiers.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} props The property identifiers to pick.
     * @returns {Object} Returns the new object.
     */
    function basePick(object, props) {
      object = Object(object);
      return basePickBy(object, props, function(value, key) {
        return key in object;
      });
    }

    /**
     * The base implementation of  `_.pickBy` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The source object.
     * @param {string[]} props The property identifiers to pick from.
     * @param {Function} predicate The function invoked per property.
     * @returns {Object} Returns the new object.
     */
    function basePickBy(object, props, predicate) {
      var index = -1,
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index],
            value = object[key];

        if (predicate(value, key)) {
          result[key] = value;
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.rest` which doesn't validate or coerce arguments.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     */
    function baseRest(func, start) {
      start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = array;
        return apply(func, this, otherArgs);
      };
    }

    /**
     * Checks if `value` is a flattenable `arguments` object or array.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
     */
    function isFlattenable(value) {
      return isArray(value) || isArguments(value) ||
        !!(spreadableSymbol && value && value[spreadableSymbol]);
    }

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
      return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
        (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 8-9 which returns 'object' for typed array and other constructors.
      var tag = isObject(value) ? objectToString.call(value) : '';
      return tag == funcTag || tag == genTag;
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == 'object' || type == 'function');
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return !!value && typeof value == 'object';
    }

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && objectToString.call(value) == symbolTag);
    }

    /**
     * Creates an object composed of the picked `object` properties.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The source object.
     * @param {...(string|string[])} [props] The property identifiers to pick.
     * @returns {Object} Returns the new object.
     * @example
     *
     * var object = { 'a': 1, 'b': '2', 'c': 3 };
     *
     * _.pick(object, ['a', 'c']);
     * // => { 'a': 1, 'c': 3 }
     */
    var pick = baseRest(function(object, props) {
      return object == null ? {} : basePick(object, arrayMap(baseFlatten(props, 1), toKey));
    });

    var lodash_pick = pick;

    const reExampleResponse = /```response(:(\d+))?\n([\s\S]*?)\n```/gm;

    function makeExampleResponse(match) {
      const code = match[2] || null;
      const value = match[3].trim();

      return { code, value };
    }

    function buildRequest (requestData) {
      requestData = lodash_pick(
        requestData,
        '_id',
        'method',
        'name',
        'description',
        'parameters',
        'url',
        'authentication',
        'body',
        'headers',
        '_type'
      );

      if (!requestData.description) {
        return requestData;
      }

      const exampleResponses = [];

      let match;

      while ((match = reExampleResponse.exec(requestData.description))) {
        exampleResponses.push(makeExampleResponse(match));
      }

      requestData.exampleResponses = exampleResponses;
      requestData.description = requestData.description.replace(
        reExampleResponse,
        ''
      );

      return requestData;
    }

    class CuteConfig {
      constructor(json) {
        this.json = json;
        this.id = null;

        this.cute = {
          workspace: {
            name: null,
            description: null
          },
          cookiejars: [],
          environments: [],
          groups: [],
          requests: []
        };
      }

      metaSort(a, b) {
        return a.metaSortKey - b.metaSortKey;
      }

      mapCookiejar(cookiejar) {
        return lodash_pick(cookiejar, 'name', 'cookies');
      }

      filterCookiejars() {
        return this.json.resources
          .filter(r => r._type === 'cookie_jar')
          .map(this.mapCookiejar);
      }

      mapEnvironment(environment) {
        return lodash_pick(environment, 'color', 'data', 'name');
      }

      filterEnvironments() {
        return this.json.resources
          .filter(r => r._type === 'environment' && !r.isPrivate)
          .sort(this.metaSort)
          .map(this.mapEnvironment);
      }

      filterRequests(groupId = null) {
        const parentId = groupId || this.id;
        return this.json.resources
          .filter(r => r._type === 'request' && r.parentId === parentId && !r.isPrivate)
          .sort(this.metaSort)
          .map(buildRequest);
      }

      deepMapGroups(predicate) {
        const group = {
          name: predicate.name,
          description: predicate.description,
          _type: predicate._type
        };

        group.children = this.json.resources
          .filter(r => r._type === 'request_group' && r.parentId === predicate._id)
          .sort(this.metaSort)
          .map(this.deepMapGroups.bind(this));

        group.requests = this.filterRequests(predicate._id);

        return group;
      }

      filterRootGroups() {
        const filteredGroups = this.json.resources.filter(r => r._type === 'request_group' && r.parentId === this.id);
        if (!filteredGroups) {
          return [];
        }

        return filteredGroups
          .sort(this.metaSort)
          .map(this.deepMapGroups.bind(this));
      }

      generate() {
        const workspace = this.json.resources.find(r => r._type === 'workspace');
        this.id = workspace._id;
        this.cute.workspace.name = workspace.name;
        this.cute.workspace.description = workspace.description;

        this.cute.cookiejars = this.filterCookiejars();
        this.cute.environments = this.filterEnvironments();

        if (this.cute.environments.length > 1) {
          this.cute.environments = this.cute.environments.slice(1);
        }

        this.cute.groups = this.filterRootGroups();
        this.cute.requests = this.filterRequests();

        return this.cute;
      }
    }

    async function app() {
      const root = document.getElementById('app');
      const rootPath = root.getAttribute('data-root') || '';

      const url =  `${rootPath}/insomnia.json`;

      window.INSOMNIA_URL = url;

      try {
        // eslint-disable-next-line no-undef
        const json = await fetch(url, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }).then(res => res.json());

        const insomniaConfig = new CuteConfig(json).generate();

        return new App({
          target: root,
          props: {
            config: insomniaConfig
          }
        });
      } catch (err) {
        console.error(err);

        return new ErrorPage({
          target: root
        });
      }
    }

    var main = app();

    return main;

}());
//# sourceMappingURL=bundle.js.map
