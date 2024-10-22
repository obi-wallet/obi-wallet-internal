import {
  MOCK_PRIMARY_KEY_KEYPAIR,
  MOCK_RECOVERY_KEY_KEYPAIR,
} from "@/mocks/multisig-key";
import { KeyMetaData } from "@/stores/key-meta-data";
import { walletDataToMultisigKey } from "@/wallet-data-flow/state";
import {
  BackupShare,
  EasyShare,
  EncryptedEasyShareForClient,
  SecretJsHomeChainId,
  WalletData,
} from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";

import { WalletDataFlow } from ".";

const meta = {
  // TODO: handle missing ed25510 key pair in WalletDataFlow
  title: "WalletDataFlow",
  component: WalletDataFlow,
  tags: ["autodocs"],
  decorators: [],
} satisfies Meta<typeof WalletDataFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

function onBack() {
  console.log("back");
}

function onDone(args: unknown) {
  window.alert("Success, see console for data");
  console.log(args);
}

export const FromScratch: Story = {
  args: {
    homeChainId: SecretJsHomeChainId.MAINNET,
    initialValues: {},
    onDone,
    onBack,
  },
};

const walletData = WalletData.parse({
  homeChainId: SecretJsHomeChainId.MAINNET,
  userEntryAddress: "secret1u2rwlzqyvkdh5sdlsxy8gceqhaxa7zq6fjjlhx",
  owner: {
    threshold: "1",
    keys: [
      {
        type: "passkey",
        publicKey: MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
      },
      {
        type: "telegram",
        publicKey: {
          type: "tendermint/PubKeySecp256k1",
          value: "AiZCSwpXotTczWZ/lLB6RVafggyui4tAZF+zCsFu3IdB",
        },
      },
    ],
  },
  encryptedShares: {
    easy: '["sbOSU9UCUS5WRyHTfLn3PoGjqfMueql+XSvoNcokrsDHfv8hvLva+nUcBDmlpjzoKFBmkWB60ZM6N6t28pbNmN0YoHRRPQaWNSS5maSa1deLZJur470BeIG7QZ/2MJsPnfHZ+i+AyksEW3tQW9T1gRINYR6AvOm6tyJIy6IU5O9bw8ItBt5jHQl1ME8JX569RHUzesmQXEVVxIT/0dYXk9tkMvvM/Hah/ghrY2Evytim89/7pF9CmO9YTND06CHmP6vvLHWv/2fheaXCqAXJkLSIL2F2+F1aNSR8tDgelN5awaxq8UKFwWHF3NRREE4n44PrDoO2ORJ2RGRl91Aa84gwPX+iQwdKxgVYnTpZhRNxgXUu13jYZxbw0cHI3Mg+/P/GN9LiN0bXqtgTgHZraIIGP1Cook+nwRSNTB3UWFT/Gk3gV8qBckhRqIGzRJ4KsX31I4jPUOPPENbTvLyWdRVKfe5lvS3a5ttosK3FkgFlFadjx/BsDLzCNGVyUxXL3dpL5ydunLOHa4ufhN+RJrzUJTx5/Hyg1iCDDp2BGnEgQAqS0Dm5noAoWonkbgGoTYrYFZNeD/chUuU3nPzJiwdQ40FwNZjvWdqn1SIlRZUTVyEnHx2c9VsMMYADnul6Lxt6KyF4Kc/ltW2GsgcPwwqWX0puV9ZLpsN35mat7A4Dy+TUc11qBnmv8sBwvLf7wwc9EDYIiKvURzswqeLwQhxenRG1/3xa8w6vPpVm+cgAbLy27zEekgn1keg2wMTuxK2WkdhrtkoC3vIvOF+e+4qacIp8HX+3MIvZJCWPSkiIEwx6p321SZkpesu09jwd05bJKN18ucl3qOKrjpmilYECnw4HWwExcyDyOzEzQWgGklPLEVssyoJE94/qe0WiCzelzD3hDYvTivMGG/aI7zQ7uZ+mQ38LOVdh9OlNyYzKFyHF96FkmPB6ziXEV/hpMKmyAzX780xdsT4BaW6T4lBISolfHIu2H5DhAL4Tohaf8sdne0OqwWJPNU6Fo6WUiiADI0fuZIg/tUliDxyhmmmAddTnU68xxmYN/fafY+yBAieU+74M8/jKUtMSH86YNUs9NwJXZYQTxAIVikzJatJ9OIhrwKPMbyQxO/nMkvxjFW9JIbobEbaFQaGWLP9xF4bIYfE38w5ermr6xs1R8LIoBTYZowrTcrnmwOGKN16VU5a6r1F2QNpJPF7c/9XVqNTst47CEFN6wAQIptYfRw==","BKAcaGOjEvHyiza9qnHWUnsrava0BgdrZxrUtj25bzRK5YWcuMiLh55vz42fpyQsccfpCNgWpptKYoYX4PGFkI9cyiT2H5oWyN+GCgMAIkwXdiq96e4PfVmucOHT5+LZTv7fQWkKS+h/BLEyBPkFLGu1Sc3dPM55rv3Nb8augJN1Pcwuglm/r7jf4D0K0bEVzUh5VOQxNUWOdc8OjkBWYDKukhZgjmRoj4LXcjgxBYGZIVPcJ/Kha97LvtrhL4/mQe4s6yjjZgQpkfOVI4oIUFLKaxJk2l39hdqR2/q0I7rw5+5f91wybUI8KjNev4T2lZ3pWAAeCw4c","BDwSgBha8KnO8T+ygAlkl7WHW4smPrVVOp3EUkNOVZ3lFlYLgXuSUQC6SorYeWylBu1kaRgft+N3L/4XzhqcmGIHhea2KmDIFlRhnFFrtriWjJPBx6Ik8Klov48coTFwpDX8AeObKBiXy22Voho5KZCZiobQMm4jd8h/8zS5uUCl+PFgQzsx+2olreouHrrLfCW5u0YTrwAB8dx4Ed8K/+/X8BTy3e7EzYhyw5fDPg5bWcuiGFuWeo7XR2aFEMLBe7K2TVdh8nBsoOSKY+jX08tRWAmhduYDDTNkQjV3j2yP00U5BjnYyQktrTR2ss/XjkEgV5gcO7hT"]',
    backup:
      '["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"]',
  },
  encryptedKeyMetaData:
    '["1ciwqbcVSbpl1WWljU9z0psPsbqsIApmGmSgrXJtJBuvoGnEfsq2Gy00x4zE7tBZuOnIxdSSg0Ftd/gQ13kf6wFDyhYjHhc7WAuXZrfg6Cu5sjI2nTBDS75rp+tEoaOjdDeljz4Jbt1gCtJie2TSmf5Dnmqw0GCcnr/FeNxNZtkKlsZwtAYiV32dxsGRIB+9NxqhAoCn+s1GkZKwPMLxc/3ZV9rKBcSPMl3QxdcG52ZhuqeEx2AAQvXNVu9eD0EpUr23T2Sxmpw=","BCvVVU09ryvDkD2Rks7X0IiH/G6tZ/IGlTMKMNUSXR5vEHHgubjJb8/KgkAyGvbQWwZYBK+F2t/5pdZ4xXBYPF6mOdxFLy9pM/8hMVTDyo75hfapqWGKzjykhOJKgcEfFjLnTJHhMlGklUrzKwrmXtRay4BBsjHd8L+AHWCENg78ZvJbrzIUWdd2xqBgFUSAgiKMuy5S6H+nrCQhAOg+a8//stSSWERN1/FSD1kikHVxtp+g3/GYgFkOv0cDpp3t5tp9WL2FDPUX36Q7eY980s8JVGNW8pfZcAAUgy0GvcLvvSh0Q8ueFVxWPAcGWm0wGYwGmauCDJQZ","BNTiwCfZC8qaXjlgTu9ZQtOomXkods5MdmXwKn7Q030ywCdkAVg6Dh1d05csKkxTEC64hhWaR4+cxjFoJhRP9Dyvg9/oRYdZJKdXL2Ixz4xCWrZZKa46DPeTZb0bnPK8emyP5VvWqpmR9Y3JFXz85UjhaAZurgu7EI/8p3p6C5mUGFhHhkHyy7V5MM5wd/xPvgLYZl4DjS9RPN7zzvH5UttrgvRpknShBrBu96faKBD66uWTU2/m9eMJcEMwUjv1cjCCfcfY6CvGgFAKdmCR/nDDoQQU1ikW5bONWilUNd0fjJh241TPV/2JAoaqktiQFsHT7ctlWyKV"]',
});

const ownerWithoutPrimaryKey = walletDataToMultisigKey({
  homeChainId: SecretJsHomeChainId.MAINNET,
  wallet: walletData,
});

const primaryKeyKeyPair = MOCK_PRIMARY_KEY_KEYPAIR;

const ownerWithPrimaryKey = ownerWithoutPrimaryKey.clone();
ownerWithPrimaryKey.removeKeyByPublicKey(primaryKeyKeyPair.publicKey);
const primaryKey = ownerWithPrimaryKey.addPasskeyKey(
  primaryKeyKeyPair.publicKey,
);
ownerWithPrimaryKey.setPrimaryKey(primaryKey);

const newPrimaryKey = MOCK_RECOVERY_KEY_KEYPAIR;
const newOwner = ownerWithPrimaryKey.clone();
newOwner.addPasskeyKey(newPrimaryKey.publicKey);

const easyShare = EasyShare.parse({
  preSignForNetworkShare: {
    k_i: {
      curve: "secp256k1",
      scalar:
        "ea43b31f52943213e02bf99125a91005bab1657f3dedc2ced5c3050e87d66067",
    },
    R: {
      curve: "secp256k1",
      point:
        "026d0b8633a050beb1e1ca7f5c31c5872a18d78bb808f29cba08e17c8c7f4836da",
    },
    sigma_i: {
      curve: "secp256k1",
      scalar:
        "7fa85eedf538db721fbaf83fade20b32ed75d1fb617fc054078b65924e780adb",
    },
    pubkey: {
      curve: "secp256k1",
      point:
        "034bf178985b2d156b73c6062fc7f71cf0ee00d9cebd68d2dbe6dec916035ca3c5",
    },
  },
  preSignForBackupShare: {
    k_i: {
      curve: "secp256k1",
      scalar:
        "ec1fc16dbf6d4c4524b197fe3bb0eef35d89f1b45d41f6d3ba57997560d7e0f5",
    },
    R: {
      curve: "secp256k1",
      point:
        "032d700f1e266cee7905a883952472e14d52304e0b7d7126d281ff8e6ddfa5a1d0",
    },
    sigma_i: {
      curve: "secp256k1",
      scalar:
        "cf2bfe283b487cb5967595b8e183ef974ea51f7325626398a91e5ceb825e456b",
    },
    pubkey: {
      curve: "secp256k1",
      point:
        "034bf178985b2d156b73c6062fc7f71cf0ee00d9cebd68d2dbe6dec916035ca3c5",
    },
  },
});

const backupShare = BackupShare.parse({
  i: 1,
  local_key: {
    y_sum_s: {
      curve: "secp256k1",
      point:
        "034bf178985b2d156b73c6062fc7f71cf0ee00d9cebd68d2dbe6dec916035ca3c5",
    },
    paillier_dk: {
      p: "139805231978584340755625316400581569117376978005015587061461395297798336194487502213667738264312127170232455332951689898292717031426127898557340887747172243796628703519303285346892107720920395115001023301711993690103750750162564680825307374824033469284761538172391845677642455814578729130226297225670442810063",
      q: "115489230818554738501563974059674881172708217024048452726824109919980805763178279586207346376864140395861733570372674688087009032274442316054595571211665880272798737944230443099008674831072611296078121303069866884776462373357825950651545385141841915827245597171186637404364268341007752572944351703694723069303",
    },
    pk_vec: [
      {
        curve: "secp256k1",
        point:
          "032697d54d10ad00d4d65670eef48fb7cf851e56c0e310344ea91f48a75213395b",
      },
      {
        curve: "secp256k1",
        point:
          "0288bd947bac09484972e7442c4eda2711a4c81687400257ec5f834e07946dbb9b",
      },
      {
        curve: "secp256k1",
        point:
          "02afdba8a95868e39121eca7b4f7f07c2d9f61a81ef7fc8ed5d7bda7102bdc505c",
      },
    ],
    keys_linear: {
      y: {
        curve: "secp256k1",
        point:
          "034bf178985b2d156b73c6062fc7f71cf0ee00d9cebd68d2dbe6dec916035ca3c5",
      },
      x_i: {
        curve: "secp256k1",
        scalar:
          "c0aceb9c597881885e869956d36c7cb7146595b1587db0e8b6032b63abdfd35d",
      },
    },
    paillier_key_vec: [
      {
        n: "21574001671568486075990722573630869642095535748308375796348853255159385754043120560924020701167109302431867052331134868336079361480316442292662438843663964551471496712842153547551784742138419261187186238731561037578619703344700971439877712023798242609056984894516518603710736727699951649159721053147170819327331983686284141731807526768996700455084404544609564412765058154480118065575807470660114606523395484715449840051217776734128159884931268566663920196460026813421671173826280936981147024805161305371488208873510387010257954340998320126693033927147848287937347927706954981170499233855760232545072739449073648210061",
      },
      {
        n: "16145998705616317107305380363246645311209320143622831508536903740067629073959201713096183107749058663258104363761867031032553532964916465997058591369542973207817084058752316862866534152891875232445745578061618834128526362520181559885248187555673434415208847811222696916726329172184207699621044179608365262750202728512615347071684580199978294972696273877804865730165213747731560633816828321961645924244096813168385667366034662506415895952397360524102063013318159739546111673128527215738371779261832640133421901572047243455431283432591971021638136709165686123978845569172630867376043787373822516065623258263095614796089",
      },
      {
        n: "17625707751113056331088314131476785078579576893213951129054161694715756363268901234533087588265490285102779396087903136389181333932543181883802786351055711836343190964338544079482086439638290934238866180811369073242260965242871866601941478104441598029339374401485167741727116687650553082676111430110346925228557472056963707754016381251550323480575401593035125277499914107193887456942890966470471082270974453421219731766284932145300393426938798618339256356703711236672034227567483621754045812183050861917642863620502451484934498769077399198779370479021707106475610123938966842814886252908075180442086551489288289300513",
      },
    ],
    h1_h2_n_tilde_vec: [
      {
        N: "afd27dd1816807215f578e42a5cee9046d919d244744403fe780c474c718fba3d1501286ba3e3fd2854e0b1725896330518177bcc28632fa835e6133c872889714898e2705a1d8c39e24a20bc40a6dc07b43530de77709ee1bab1aad6c7b3700b430908afcd81f1afd6bd652d0511581964829aa8225f0d9147aec1b20e183eaabca1b9eb0ada4804da546ef8b7e207c1aa51f0e725bbda8e510263abf656679b2cb6d54b5bd4a94e13bd9fd9b1950ed050e5d5f0dab2f48526609ac9b981dea1513515baa19410b7f99d77a42937268d987e3eb1d1a5211eb8bba4a607bfb4b413183593ea07f4b0e73f5a5ebb1e33e143bcfa683361d0892e6b8148455a9d5",
        g: "1919916e29238ba2e5b30fe4a5af991c4883ded7ce0c9cb5d03a52740383679069294f663612af75fd9efddae7b0c272428e818dff12d5dc153a66347b5591c2dbd53a8e788bf196a81ad5838c24d08ab6f2d8468bb4d73149531971ba16724b5837c9889e451bfc93c6f8f65163013bffb62bd73a9770cc79b741f9f3e271670d36a14f0f796baeab26cf3f7e1487776f3f14a1f36452ebf5f38a0ed092a4d2579934ef6f3d7f35b4cb677203b3c176839db93b34a5f496b1f55eabc254467b64d4a7561dcdb5623b76e812d4336c0b2993463dbe95926de1f5484188e5ee7f9741fa47c6aa743e4967ef8339c93c561beb42a3ae7577a99f9d8541ae2d48ed",
        ni: "1b7b1fdca6b5d589aa26a82d735f5f3d6e957cbc395af77f57f540952bd942a05d3eb1d4491e1c289a5aec20cbc18d131de8392b4d7e2969d2bc079bc8c0eb25a5b2ccbca58503ea1f3ac3e292fa418433863ca55fcc34e8f2650a9332f52193b3d4def6ea579cebdcd74fadc969bba68c0820c6484a4770f0a980aefb077d857ec279941feb9d79be78245ba59454babc3cd6a957d1f6af3d98fc613a27d724569159831d0ad2ff9594a76d008f7a3bc368e1194310f2211f7cbb566036e9badaadcdd2f2ec22f5ee9aa07d4880435535c1078787d53fd7016b670a86e2a8ca1cb426bb40a421a1e2c935d6b100a2c81f9f4d8f92da049f17c99600dca5fbc8",
      },
      {
        N: "54a7483457d26d0f1b919ab0c177d2baa07dbe0152edf0831222da01572baf8e467403186e39f4fe80b999e32f6bdac11b193c24c2ae4b428f08c21798d2c095308a1ad72ef167e60b41d61e4efcc112cadcccfa8bb79f42b39aa8bd994c4ac1d3c04555ac38abe92669c5df9a9f95754be26e3fe299b90fc9c031cdf5ec25d60f778abd90ceeb13e9f15d37802fe94e286cd28fdad27b42ffa77dd38cf699c70a5c3b58359519f47574be0028e90178cbd69d087253c147e133bcec20d949c21cb1a26fbe782296c7c45d5779daed0492e12ddf5f20bd54f29d54bf40fa2f4f01421c1d5c5071c3d5f74b9530bbed70362a964cc03f0a383125019e20622bcf",
        g: "2966e3882d1201ce40ec2a888e33ef9233b6c837cd100a76f242ee49b5305596caba97650514edbeb58ebe3e5843b2d66a4162d64c5304b07abe23c6ff7882a80f17d13e7469e7bab17f1ae842f16247a7651a5c86d1225f5f73ed952e6cea3770d21bd4522f69d3b85ecc1ac5027eda62c1d772274ac83dfef4f5c6311b380e3330ffd00d1170758cfeb365acf319d69d52249f0fbb26bd14f5280677b6c83bd70eebe629d2d4fbe6f772470921b465456872713be59d854c0e0492062a252ca2b62a2074a949243db62fbcc3cb6a768d20cd631805de15ee39d6bd24de1a67befcca72691204c3528f8f81e703e75baa94d38261f907af7f5239345bcdd57c",
        ni: "4f16396374c4728dae7a2aec289de27e50c369d4c232dc69cdad0b08d9c282cd09d7ee31bb0800b088d55a0f5fb4cde0a0ad0ca520905571e87e83bd4769c804cb1f64406fd5fe4cd8b2b454579dd789886f55e55d268abad417f1d78209c0ff8c99d57fc4d78a511135d9ada5f45fb1950815c92101accf2a9139787ae4c2acf87fb3e5da01c8f9b542d9839f5512a1aa10d83c22660275a6db3cf987d9d7cb24842fc27a11b843d5bc9b54ec519cd2dcad00719fc98894fc8981ea90fe8fd8555b32c64be14ef2dc38770939287feb9d41b552f017c7e3a541c552a8f2429d7d9142801c1bf45e1837cff433fba617afd31a808abf341e711c643f9c3944d3",
      },
      {
        N: "76f09c0139397fe0f6e476533e5d4d669eea57ebd0b567f7e21603d46fd13159250a9caea9086e6f6a3fc10e4be2b763aa31edbb4a43bc02baaae797c1ffbf4ef0d6e1f013c9b4d0712cd5bab6d9b8e2e5baf40633712b03a69041b701f64cd4519ec497dd41cccd5216e2ca9d85d5e1b13fad7a4cacf6a89b8f36f9ddccf89e4253c2b87f1e6e658ddf7c063f6082bb8766fc9b5b2d81b35b8b4936038506e1c38c8924f4b14297e4e15898df391103732318af7eda9180d9edfffef73a994e32d047a527ced0cdab1c0bdfc0836e56195a16a83394264fced5e1603bcbde6a968a66cf85a381b380c229ac23e6b85675850b1f64f52433b062803b2a246031",
        g: "13d170c87435335d21c5ab6342d2a5feec1ba0508ebea31f3f844e8fdebb81e7778a2dff2215f0c37590c75d9511e1930bd8b51f2d2306f31d7802070c979e78153a65c66ca9618db20c277217a568dceb4f4a9487d604add36dc79ebc2f8816c58a25db0ee3d643fcdbe503945ff0dc95bfded9d75bc35468c05ea136b15ab77be8af05a5d1e0dbdd5ed7bbf63462a5c4dab8dfc3e4a059c88a9676c6d4e3b0bfc71fd5e01734151bb04e56e870fdd0007e585cbafa85a7d0702a3d96791b87553545633397edc4ba0ee2bbf0a7653367b747cf40f46d4d728cbcaafd8f157c33cf52be1f6e96922408f07f94ede81d46ebf6c5936d04b74d8a70dd478aeec7",
        ni: "54207c9f9c3355fd84d60aa097c26659be2348bfa7293ee8861d176444d877184252935c3f0eb3fefb981807873dda85fc4585639419788f91e6d9cd1dd2db771c2daac3622cb7428986f3de7d54a4a0f88a210b129fd38095873d7e085bc1ad6e53ab37914fa0fab63f6b3d3fc8ea3839133c38af1c60e22ea947a155a7149005829113a7316e9f58a3ab11658a7b20b570dcba5146966b20215b97709f21600b004c8c7f872dde97d0ddecdea9fcb5b5784e6089da844b3f71a4556bb1b15872a6a5830c861ac7d6e315c710e45b4bd8dd4f70b479de1f6b9afab7e11f8cf782800f65027cc536fd8bd3bc5a3a61e2f3650b823fbc52505fb96268dcdccafb",
      },
    ],
    vss_scheme: {
      parameters: {
        threshold: 1,
        share_count: 3,
      },
      commitments: [
        {
          curve: "secp256k1",
          point:
            "023f21b9987371f874ffa2f15d24d8ff5181ed27733ea5a8d194942bd3132eeec7",
        },
        {
          curve: "secp256k1",
          point:
            "038440b279fb28d31837e1f9eb4699cf63eac894ddcc9442f72d1f92cb3dc14c7b",
        },
      ],
      proof: {
        pk: {
          curve: "secp256k1",
          point:
            "023f21b9987371f874ffa2f15d24d8ff5181ed27733ea5a8d194942bd3132eeec7",
        },
        pk_t_rand_commitment: {
          curve: "secp256k1",
          point:
            "035fbb61ca6e6137355ebffd69c799c2505c3ea0491c71cf3e8307d4517c94dfe7",
        },
        challenge_response: {
          curve: "secp256k1",
          scalar:
            "70c7f48def6b1e7c189474222aab6fc1622ff51d87ef70d1502671027c70ae0a",
        },
      },
    },
    i: 2,
    t: 1,
    n: 3,
  },
  sign_keys: {
    k_i: {
      curve: "secp256k1",
      scalar:
        "e70efae5b151a92cd981d82d2f8cc85cf556864f265730ed2e1395dca44049ab",
    },
    w_i: {
      curve: "secp256k1",
      scalar:
        "4206c2d50c6984991b93cc047a457627c7d30746aae7d242a264c5116332f795",
    },
    g_w_i: {
      curve: "secp256k1",
      point:
        "033e3756b622efa099573c0bd6f517922b91b4b747f2da156b22c33098cd2f10ed",
    },
    gamma_i: {
      curve: "secp256k1",
      scalar:
        "445e01a4a051406cdcd9c01849a953113fe3e92e33a2a29aa17171f8ad13a0c0",
    },
    g_gamma_i: {
      curve: "secp256k1",
      point:
        "0367e7a2a81dfba40b2bd0c4240648a0f2cdeee0cdba662ba68c6cba92d77db4c7",
    },
  },
  R: {
    curve: "secp256k1",
    point: "032d700f1e266cee7905a883952472e14d52304e0b7d7126d281ff8e6ddfa5a1d0",
  },
  sigma_i: {
    curve: "secp256k1",
    scalar: "81f4dd2ed6389a6fba33bb64d17045545b85c22dbbe4af69f98a2050b6d0f1b5",
  },
  t_vec: [
    {
      curve: "secp256k1",
      point:
        "02301419e340d48cbb4871ac852c3a5e4b4aca9b60c96af4285622fb735a53103f",
    },
    {
      curve: "secp256k1",
      point:
        "032271f594dc27ac2a65a7e0058fa2629ac4a0254f5df4bd5c118253ea05c47285",
    },
  ],
});

const locallyEncryptedSharesByPreviousOwner = {
  easy: EncryptedEasyShareForClient.parse(
    serialize(["", walletData.encryptedShares.easy]),
  ),
  backup: walletData.encryptedShares.backup,
};

const keyMetaData = KeyMetaData.parse({
  "AiZCSwpXotTczWZ/lLB6RVafggyui4tAZF+zCsFu3IdB": {
    name: "@inyono",
    timestamp: "2024-04-14T15:15:17.945+02:00",
    payload: {
      chatId: "267806317",
      securityQuestion: "FOOBAR",
    },
  },
});

const newKeyMetaData = KeyMetaData.parse({
  ...keyMetaData,
  [newPrimaryKey.publicKey.value]: {
    name: "New Device",
    timestamp: DateTime.now().toISO(),
  },
});

export const ViaPassKey: Story = {
  args: {
    homeChainId: SecretJsHomeChainId.MAINNET,
    initialValues: {
      owner: ownerWithPrimaryKey,
      walletData,
    },
    onDone,
    onBack,
  },
};

export const ViaTelegramKey: Story = {
  args: {
    homeChainId: SecretJsHomeChainId.MAINNET,
    initialValues: {
      owner: ownerWithoutPrimaryKey,
      walletData,
      keyMetaData: {
        "AiZCSwpXotTczWZ/lLB6RVafggyui4tAZF+zCsFu3IdB": {
          name: "",
          timestamp: "2024-04-14T15:18:06.542+02:00",
          payload: {
            chatId: "267806317",
            securityQuestion: "FOOBAR",
          },
        },
      },
    },
    mockOnly: true,
    onDone,
    onBack,
  },
};

export const ViaTelegramKeyStep2: Story = {
  args: {
    homeChainId: SecretJsHomeChainId.MAINNET,
    initialValues: {
      owner: ownerWithoutPrimaryKey,
      walletData,
      shares: {
        easy: easyShare,
        backup: backupShare,
      },
      keyMetaData,
    },
    mockOnly: true,
    onDone,
    onBack,
  },
};

export const UpdatingOwner: Story = {
  args: {
    homeChainId: SecretJsHomeChainId.MAINNET,
    initialValues: {
      owner: ownerWithoutPrimaryKey,
      newOwner,
      walletData,
      shares: {
        easy: easyShare,
        backup: backupShare,
      },
      keyMetaData,
      newKeyMetaData,
    },
    mockOnly: true,
    onDone,
    onBack,
  },
};

export const SecuritySettings: Story = {
  args: {
    homeChainId: SecretJsHomeChainId.MAINNET,
    initialValues: {
      owner: ownerWithPrimaryKey,
      walletData,
      keyMetaData,
      locallyEncryptedSharesByPreviousOwner,
    },
    mockOnly: true,
    onDone,
    onBack,
  },
};

export const ConfirmSecuritySettings: Story = {
  args: {
    homeChainId: SecretJsHomeChainId.MAINNET,
    initialValues: {
      owner: ownerWithPrimaryKey,
      newOwner,
      walletData,
      keyMetaData,
      newKeyMetaData,
      locallyEncryptedSharesByPreviousOwner,
    },
    mockOnly: true,
    onDone,
    onBack,
  },
};
