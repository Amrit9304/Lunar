class Command {
    constructor(name, options) {
        this.name = name;
        this.description = Array.isArray(options.description) ? options.description : [options.description || ''];
        this.aliases = options.aliases || [];
        this.category = options.category || '';
        this.usage = options.usage || '';
        this.group = options.group || false;
        this.private = options.private || false;
        this.admin = options.admin || false;
        this.mods = options.mods || false;
        this.rowner = options.rowner || false;
        this.restrict = options.restrict || false;
    }

    toHandlerObject() {
        return {
            command: Array.isArray(this.aliases) ? [this.name, ...this.aliases] : [this.name],
            aliases: this.aliases || [],
            description: this.description || '',
            category: this.category || '',
            usage: this.usage || '',
            group: this.group || false,
            private: this.private || false,
            admin: this.admin || false,
            mods: this.mods || false,
            owner: this.rowner || false,
            restrict: this.restrict || false
        };
    }
}

export default Command;
