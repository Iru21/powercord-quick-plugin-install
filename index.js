const { Plugin } = require('powercord/entities');
const { execSync } = require("child_process");
const fs = require("fs");
const path = require('path'); 

module.exports = class QuickPluginInstall extends Plugin {
    startPlugin () {
        powercord.api.commands.registerCommand({
            command: 'qinstall',
            description: 'Quickly installs powercord plugins with one simple command',
            usage: '{c} [github repo link]',
            executor: async (args) => {
                if (args.length != 1) {
                    return;
                }
                const plugin_folder = powercord.pluginManager.pluginDir
                const plugin_name = args[0].replace(/\/$/, '').split("/").pop()
                const plugin_path = path.join(plugin_folder, plugin_name)
                console.log(plugin_path)
                if(fs.existsSync(plugin_path)) {
                    console.log(`%c[Quick Install] `, `color: #ffacac`, "Plugin exists, removing...");
                    fs.rmdirSync(plugin_path, { recursive: true })
                    await sleep(100)
                }
                console.log(`%c[Quick Install] `, `color: #ffacac`, "Cloning from repo...");
                await execSync("git clone " + args[0], {cwd: plugin_folder})
                await sleep(3000)
                console.log(`%c[Quick Install] `, `color: #ffacac`, "Mounting...");

                //may throw an error if not already mounted but can be ignored
                powercord.pluginManager.unmount(plugin_name)
                await sleep(100)
                powercord.pluginManager.mount(plugin_name)

                //may throw an error if not already loaded but can be ignored
                powercord.pluginManager.unload(plugin_name)
                await sleep(100)
                powercord.pluginManager.load(plugin_name)

                console.log(`%c[Quick Install] `, `color: #ffacac`, plugin_name + " installed");
                powercord.api.notices.sendToast("quick-plugin-install", {
                    header: "Quick Plugin Install",
                    content: "Success!",
                    type: 'success',
                    timeout: 2e3,
                });
                return {
                    send: false,
                    result: `\`${plugin_name}\` installed successfully!`
                }
            },
        });
    }

    pluginWillUnload () {
        powercord.api.commands.unregisterCommand('qinstall');
    }
};

async function sleep(ms) {
    return new Promise((resolve, reject) => {
        try {
            setTimeout(() => resolve(), ms)
        } catch (e) {
            reject(e)
        }
    })
        
}
