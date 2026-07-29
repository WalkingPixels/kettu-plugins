import { patcher, metro } from "@kettu"; 
import { React } from "@kettu/common";

const { showContextMenu } = metro.findByProps("showContextMenu");
const Clipboard = metro.findByProps("setString", "getString");
const MessageStore = metro.findByProps("getMessage", "getMessages");
const Toast = metro.findByProps("showToast", "openLazy");

export default {
    onLoad: () => {
        this.unpatch = patcher.after("showContextMenu", metro.findByProps("showContextMenu"), (args) => {
            const [menuProps] = args;
            if (!menuProps || menuProps.type !== "MESSAGE_ACTION_SHEET") return;

            const messageId = menuProps.message?.id;
            const channelId = menuProps.channel?.id;
            if (!messageId || !channelId) return;

            const message = MessageStore.getMessage(channelId, messageId);
            
            if (message?.stickerItems && message.stickerItems.length > 0) {
                const targetSticker = message.stickerItems[0];
                const stickerUrl = `https://discordapp.net{targetSticker.id}.png?size=1024`;

                menuProps.actions.push({
                    label: "Save Sticker Link",
                    icon: "download", 
                    onPress: async () => {
                        try {
                            Clipboard.setString(stickerUrl);
                            if (Toast?.showToast) {
                                Toast.showToast({ title: "Sticker link copied to clipboard!" });
                            }
                        } catch (error) {
                            console.error("Save Sticker error:", error);
                        }
                    }
                });
            }
        });
    },
    onUnload: () => {
        if (this.unpatch) this.unpatch();
    }
};
