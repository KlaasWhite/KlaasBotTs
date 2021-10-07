import { CommandInteraction, GuildMember, Interaction, InternalDiscordGatewayAdapterCreator, StageChannel, TextBasedChannels, TextChannel, VoiceChannel, VoiceState } from "discord.js";
import ytdl, { videoInfo } from "ytdl-core"
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice"


interface ISong{
    title: string,
    url: string
}

class Queue{
    textChannel: TextBasedChannels;
    voiceChannel: VoiceChannel|StageChannel;
    connection: VoiceConnection;
    player: AudioPlayer;
    songs: ISong[];
    volume: number;
    playing: boolean;

    constructor(textChannel:TextBasedChannels, voiceChannel: VoiceChannel|StageChannel){
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.connection = null;
        this.player = null;
        this.songs = [];
        this.volume = 5;
        this.playing = true;
    }
}

const queue = new Map<string, Queue>();

export async function music(interaction:CommandInteraction){

    let subcommand: string = interaction.options.getSubcommand();

    let member:GuildMember = interaction.member as GuildMember

    let requester:GuildMember = await interaction.guild.members.fetch(member.id) as GuildMember;
    let voiceChannel:VoiceChannel|StageChannel = requester.voice.channel;

    let serverQueue:Queue = queue.get(interaction.guild.id);

    if (!voiceChannel){
        interaction.reply("Requester is not connected to a voice channel or stage channel")
        return;
    }
    
    switch (subcommand) {
        case "play":
            request(serverQueue, interaction, voiceChannel)
            return;
        case "skip":
            return;
        default:
            return;
    }
}

async function request(serverQueue:any, interaction:CommandInteraction, voiceChannel:VoiceChannel|StageChannel) {

    let request:string = interaction.options.getString("video")

    let songInfo:videoInfo = await ytdl.getInfo(request)
    let song:ISong = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    }

    if (!serverQueue){
        createServerQueue(interaction, voiceChannel, song);
        interaction.reply(`${song.title} has been send to play`)
    } else {
        serverQueue.songs.push(song);
        interaction.reply(`${song.title} has been added to the queue`)
    }
}

async function createServerQueue(interaction:CommandInteraction, voiceChannel:VoiceChannel|StageChannel, song:ISong){

    let queueContruct = new Queue(interaction.channel, voiceChannel)

    queue.set(interaction.guild.id, queueContruct);
  
    queueContruct.songs.push(song);



    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id, 
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        })
        connection.subscribe(player);
        queueContruct.connection = connection;
        queueContruct.player = player;
        play(interaction.guild.id, queueContruct.songs[0]);
    } catch (err) {
        console.log(err);
        queue.delete(interaction.guild.id);
    }
}

async function play(guild:string, song:ISong) {
    const serverQueue = queue.get(guild);
    if (!song) {
        serverQueue.player.stop();
        serverQueue.connection.destroy();
        queue.delete(guild);
        return;
    }

    // ytdl(song.url, {filter: "audioonly"})
    // const resource: AudioResource = createAudioResource(stream);
    console.log(ytdl(song.url, {filter: "audioonly"}))
   
    // serverQueue.player.play(ytdl(song.url, {filter: "audioonly"}))
    // serverQueue.player.on("stateChange", (status) => {
    //     console.log(status);
    //     if (status.status === AudioPlayerStatus.Idle){
    //         serverQueue.songs.shift();
    //         play(guild, serverQueue.songs[0]);
    //     }
    // })
    // .on("error", error => console.error(error));
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }