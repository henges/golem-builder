export type GolemData = {
    bodies: Record<string, GolemBody>
}

export type GolemBody = {
    body: ExportObject
    patterns: string[][]
    models: ExportObject[]
    patternMap: Record<string, number> 
}

export type ExportObject = {
    id: string
    render: ExportRender
}

export type ExportRender = {
    displayName: string
    tile: string
    mainColour: string
    detailColour: string
}