import React from "react";
import "yet-another-react-lightbox/styles.css";
import {useQuery} from "react-query";
import {AlbumType} from "../../models/albumType";
import {Box} from "@mui/material";
import {baseURL} from "../../controllers/API";
import {Link} from "react-router-dom";


export const AlbumsPage = () => {
    const {data: albums} = useQuery<AlbumType[]>('albums');

    return <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            rowGap: 1,
            columnGap: 2,
            p: 2
        }}
    >
        {albums?.map(album => {
            return <Link to={'/albums/' + album.uuid} style={{textDecoration: 'none', color: 'inherit'}} key={album.uuid}>
                <Box
                    sx={theme=>({
                        cursor: 'pointer',
                        p:2,
                        display:'flex',
                        flexDirection: 'column',
                        flex:1,
                        minWidth: 150,
                        '&:hover':{
                            opacity: 0.8
                        }
                    })}
                >
                    <img
                        loading="lazy"
                        src={baseURL + album.thumbnail_src}
                        alt={album.name}
                        style={{
                            width: '100%',
                            aspectRatio: 1,
                            objectFit: 'cover',
                            borderRadius: 8,
                            marginBottom: 4
                    }}/>
                    {album.name}
                </Box>
            </Link>
        })}
    </Box>
}