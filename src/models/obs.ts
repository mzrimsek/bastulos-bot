export type ObsActionType =
  | 'GetSceneItemProperties'
  | 'SetSceneItemRender'
  | 'SetSourceFilterVisibility'
  | 'SetSourceFilterSettings'
  | 'ToggleMute';

export interface ObsActionArgs extends Record<string, any> {
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
    filterSettings: Record<string, string>;
  };

  ToggleMute: {
    source: string;
  };
}
