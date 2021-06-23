export type ObsActionType =
  | 'GetSceneItemProperties'
  | 'SetSceneItemRender'
  | 'SetSourceFilterVisibility'
  | 'SetSourceFilterSettings'
  | 'ToggleMute'
  | 'SetMute';

export interface ObsActionArgs extends Record<ObsActionType, any> {
  GetSceneItemProperties: {
    item: {
      name: string;
    };
  };

  SetSceneItemRender: {
    source: string;
    render: boolean;
  };

  SetSourceFilterVisibility: {
    sourceName: string;
    filterName: string;
    filterEnabled: boolean;
  };

  SetSourceFilterSettings: {
    sourceName: string;
    filterName: string;
    filterSettings: Record<string, string | number | boolean>;
  };

  ToggleMute: {
    source: string;
  };

  SetMute: {
    source: string;
    mute: boolean;
  };
}
