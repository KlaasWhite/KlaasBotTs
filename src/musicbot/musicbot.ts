import Discord, {
    Interaction,
    GuildMember,
    Snowflake,
    CommandInteraction,
} from "discord.js";
import {
    AudioPlayerStatus,
    AudioResource,
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import { Track } from "./resources/track";
import { MusicSubscription } from "./resources/subscription";

const subscriptions = new Map<Snowflake, MusicSubscription>();

export async function music(interaction: CommandInteraction) {
    let subcommand: string = interaction.options.getSubcommand();
    let subscription = subscriptions.get(interaction.guildId);

    if (subcommand === "play") {
        await interaction.deferReply();
        // Extract the video URL from the command
        const url = interaction.options.get("song")!.value! as string;

        // If a connection to the guild doesn't already exist and the user is in a voice channel, join that channel
        // and create a subscription.
        if (!subscription) {
            if (
                interaction.member instanceof GuildMember &&
                interaction.member.voice.channel
            ) {
                const channel = interaction.member.voice.channel;
                subscription = new MusicSubscription(
                    joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                    })
                );
                subscription.voiceConnection.on("error", console.warn);
                subscriptions.set(interaction.guildId, subscription);
            }
        }

        // If there is no subscription, tell the user they need to join a channel.
        if (!subscription) {
            await interaction.followUp(
                "Join a voice channel and then try that again!"
            );
            return;
        }

        //Make sure the connection is ready before processing the user's request
        try {
            await entersState(
                subscription.voiceConnection,
                VoiceConnectionStatus.Ready,
                20e3
            );
        } catch (error) {
            console.warn(error);
            await interaction.followUp(
                "Failed to join voice channel within 20 seconds, please try again later!"
            );
            return;
        }

        try {
            // Attempt to create a Track from the user's video URL
            const track = await Track.from(url, {
                onStart() {
                    interaction
                        .followUp({ content: "Now playing!", ephemeral: true })
                        .catch(console.warn);
                },
                onFinish() {
                    interaction
                        .followUp({ content: "Now finished!", ephemeral: true })
                        .catch(console.warn);
                },
                onError(error) {
                    console.warn(error);
                    interaction
                        .followUp({
                            content: `Error: ${error.message}`,
                            ephemeral: true,
                        })
                        .catch(console.warn);
                },
            });
            // Enqueue the track and reply a success message to the user
            subscription.enqueue(track);
            await interaction.followUp(`Enqueued **${track.title}**`);
        } catch (error) {
            console.warn(error);
            await interaction.reply(
                "Failed to play track, please try again later!"
            );
        }
    } else {
        if (!subscription) {
            await interaction.reply("Not playing in this server!");
            return;
        }
        switch (subcommand) {
            case "skip":
                // Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
                // listener defined in music/subscription.ts, transitions into the Idle state mean the next track from the queue
                // will be loaded and played.
                subscription.audioPlayer.stop();
                await interaction.reply("Skipped song!");
                return;
            case "queue":
                const current =
                    subscription.audioPlayer.state.status ===
                    AudioPlayerStatus.Idle
                        ? `Nothing is currently playing!`
                        : `Playing **${
                              (
                                  subscription.audioPlayer.state
                                      .resource as AudioResource<Track>
                              ).metadata.title
                          }**`;

                const queue = subscription.queue
                    .slice(0, 5)
                    .map((track, index) => `${index + 1}) ${track.title}`)
                    .join("\n");

                await interaction.reply(`${current}\n\n${queue}`);
                return;
            case "pause":
                subscription.audioPlayer.pause();
                await interaction.reply({
                    content: `Paused!`,
                    ephemeral: true,
                });
            case "resume":
                subscription.audioPlayer.unpause();
                await interaction.reply({
                    content: `Unpaused!`,
                    ephemeral: true,
                });
                return;
            case "leave":
                subscription.voiceConnection.destroy();
                subscriptions.delete(interaction.guildId);
                await interaction.reply({
                    content: `Left channel!`,
                    ephemeral: true,
                });
                return;
            default:
                await interaction.reply("Unknown command");
                return;
        }
    }
}
